import { onAuthStateChanged } from 'firebase/auth'
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { useEffect, useRef, useState } from 'react'
import {
  getFirebaseAuth,
  getFirebaseDb,
  isFirebaseConfigured,
} from '../services/firebase'
import {
  getSupabaseClient,
  isSupabaseConfigured,
  SUPABASE_STATE_TABLE,
} from '../services/supabase'
import { safeJsonParse } from '../utils/storage'

const getInitialValue = (initialValue) =>
  typeof initialValue === 'function' ? initialValue() : initialValue

const getStateDoc = (db, cloudKey) =>
  doc(db, 'stores', 'mossi-shop', 'state', cloudKey)

export function useCloudStorage(key, initialValue, cloudKey) {
  const [value, setValue] = useState(() => {
    const fallback = getInitialValue(initialValue)
    return safeJsonParse(localStorage.getItem(key), fallback)
  })
  const lastRemoteValue = useRef(null)
  const cloudReady = useRef(false)

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return undefined
    }

    const supabase = getSupabaseClient()

    if (!supabase) {
      return undefined
    }

    let isMounted = true
    cloudReady.current = false

    const syncInitialValue = async () => {
      const localValue = safeJsonParse(
        localStorage.getItem(key),
        getInitialValue(initialValue),
      )

      const { data, error } = await supabase
        .from(SUPABASE_STATE_TABLE)
        .select('value')
        .eq('key', cloudKey)
        .maybeSingle()

      if (!isMounted) {
        return
      }

      if (error) {
        console.warn(`Supabase sync disabled for ${cloudKey}:`, error.message)
        return
      }

      if (data) {
        const nextValue = data.value ?? getInitialValue(initialValue)
        lastRemoteValue.current = JSON.stringify(nextValue)
        setValue(nextValue)
        cloudReady.current = true
        return
      }

      const serializedLocalValue = JSON.stringify(localValue)
      lastRemoteValue.current = serializedLocalValue
      cloudReady.current = true

      const { error: upsertError } = await supabase
        .from(SUPABASE_STATE_TABLE)
        .upsert({
          key: cloudKey,
          value: localValue,
          updated_at: new Date().toISOString(),
        })

      if (upsertError) {
        console.warn(`Supabase sync disabled for ${cloudKey}:`, upsertError.message)
      }
    }

    syncInitialValue()

    const channel = supabase
      .channel(`mossi-state-${cloudKey}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: SUPABASE_STATE_TABLE,
          filter: `key=eq.${cloudKey}`,
        },
        (payload) => {
          const nextValue = payload.new?.value

          if (nextValue === undefined) {
            return
          }

          lastRemoteValue.current = JSON.stringify(nextValue)
          setValue(nextValue)
          cloudReady.current = true
        },
      )
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(channel)
    }
  }, [cloudKey, initialValue, key])

  useEffect(() => {
    if (isSupabaseConfigured() || !isFirebaseConfigured()) {
      return undefined
    }

    const auth = getFirebaseAuth()
    const db = getFirebaseDb()

    if (!auth || !db) {
      return undefined
    }

    let unsubscribeSnapshot = null

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot()
        unsubscribeSnapshot = null
      }

      cloudReady.current = false

      if (!firebaseUser) {
        return
      }

      const stateDoc = getStateDoc(db, cloudKey)

      unsubscribeSnapshot = onSnapshot(
        stateDoc,
        async (snapshot) => {
          if (snapshot.exists()) {
            const nextValue = snapshot.data().value ?? getInitialValue(initialValue)
            lastRemoteValue.current = JSON.stringify(nextValue)
            setValue(nextValue)
            cloudReady.current = true
            return
          }

          const localValue = safeJsonParse(
            localStorage.getItem(key),
            getInitialValue(initialValue),
          )
          lastRemoteValue.current = JSON.stringify(localValue)
          cloudReady.current = true
          await setDoc(stateDoc, {
            value: localValue,
            updatedAt: serverTimestamp(),
            updatedBy: firebaseUser.email,
          })
        },
        (error) => {
          console.warn(`Cloud sync disabled for ${cloudKey}:`, error.message)
        },
      )
    })

    return () => {
      unsubscribeAuth()
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot()
      }
    }
  }, [cloudKey, initialValue, key])

  useEffect(() => {
    if (!cloudReady.current) {
      return undefined
    }

    const serializedValue = JSON.stringify(value)

    if (serializedValue === lastRemoteValue.current) {
      return undefined
    }

    const timeout = window.setTimeout(async () => {
      if (isSupabaseConfigured()) {
        const supabase = getSupabaseClient()

        if (!supabase) {
          return
        }

        const { error } = await supabase.from(SUPABASE_STATE_TABLE).upsert({
          key: cloudKey,
          value,
          updated_at: new Date().toISOString(),
        })

        if (error) {
          console.warn(`Supabase write failed for ${cloudKey}:`, error.message)
          return
        }

        lastRemoteValue.current = serializedValue
        return
      }

      const auth = getFirebaseAuth()
      const db = getFirebaseDb()
      const firebaseUser = auth?.currentUser

      if (!db || !firebaseUser) {
        return
      }

      const stateDoc = getStateDoc(db, cloudKey)
      await setDoc(
        stateDoc,
        {
          value,
          updatedAt: serverTimestamp(),
          updatedBy: firebaseUser.email,
        },
        { merge: true },
      )
      lastRemoteValue.current = serializedValue
    }, 350)

    return () => window.clearTimeout(timeout)
  }, [cloudKey, value])

  return [value, setValue]
}
