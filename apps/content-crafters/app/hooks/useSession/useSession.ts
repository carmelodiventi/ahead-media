import {useEffect, useState} from "react";
import {Session} from "@supabase/supabase-js";
import {useLoaderData} from "@remix-run/react";
import {loader} from "~/content-crafters/routes/_app";
import {createBrowserClient} from "@supabase/ssr";

const useSession = () => {
    const {env} = useLoaderData<typeof loader>()
    const [supabase] = useState(() =>
        createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
    )
    const [session, setSession] = useState<null | Session>(null)

    useEffect(() => {

        supabase.auth.getSession().then(({data: {session}}) => {
            setSession(session)
        })

        const {
            data: {subscription},
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
        })

        return () => subscription.unsubscribe()
    }, [])

    return session
}

export default useSession
