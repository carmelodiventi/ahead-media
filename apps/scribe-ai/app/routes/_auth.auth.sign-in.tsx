import { ActionFunctionArgs, json, LoaderFunctionArgs, MetaFunction, redirect } from '@remix-run/node'
import { Form, useActionData, useNavigation } from '@remix-run/react'
import { Button, Callout, Card, Flex, Heading, Text, TextField } from '@radix-ui/themes'
import { InfoCircledIcon } from '@radix-ui/react-icons'
import {createSupabaseServerClient} from "../utils/supabase.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { supabaseClient } = createSupabaseServerClient(request)
    const {
        data: { user },
    } = await supabaseClient.auth.getUser()

    if (user) {
        return redirect('/app/dashboard')
    }

    return json({})
}

export const meta: MetaFunction = () => {
    return [{ title: 'Sign In' }, { name: 'description', content: 'Sign in to your account' }]
}

export const action = async ({ request }: ActionFunctionArgs) => {
    const { supabaseClient, headers } = createSupabaseServerClient(request)
    const formData = await request.formData()
    const { error } = await supabaseClient.auth.signInWithOtp({
        email: formData.get('email') as string,
        options: {
            emailRedirectTo: `${process.env.APP_URL}/auth/callback`,
        },
    })
    // just for this example
    // if there is no error, we show "Please check you email" message
    if (error) {
        return json({ success: false }, { headers })
    }
    return json({ success: true }, { headers })
}

const SignIn = () => {
    const actionResponse = useActionData<typeof action>()
    const { state } = useNavigation()
    const submitting = state === 'submitting'
    return (
        <>
            <div className="mx-auto w-full md:max-w-md relative">
                <Card size="4" variant="classic">
                    <Heading as="h3" size="6" trim="start" mb="1" align="center">
                        Welcome to Content Crafters
                    </Heading>
                    <Text as="p" size="3" mb="5" color="gray" align="center">
                        Craft Your Story
                    </Text>

                    {!actionResponse?.success ? (
                        <Form method="post">
                            <Flex direction="column" gap="4">
                                <TextField.Root
                                    type="email"
                                    name="email"
                                    placeholder="Your Email"
                                    required
                                    disabled={submitting}
                                />
                                <Button type="submit" loading={submitting}>
                                    Sign In
                                </Button>
                            </Flex>
                        </Form>
                    ) : (
                        <Callout.Root>
                            <Callout.Icon>
                                <InfoCircledIcon />
                            </Callout.Icon>
                            <Callout.Text>Please check your email to continue login</Callout.Text>
                        </Callout.Root>
                    )}
                </Card>
            </div>
        </>
    )
}
export default SignIn
