import { Outlet } from '@remix-run/react'
import { Flex } from '@radix-ui/themes'

export default function AuthLayout() {
    return (
        <Flex
            height="100vh"
            direction="column"
            align="center"
            justify="center"
            py={'12'}
            px={{
                sm: '6',
                lg: '20',
                xl: '24',
            }}
        >
            <Outlet />
        </Flex>
    )
}
