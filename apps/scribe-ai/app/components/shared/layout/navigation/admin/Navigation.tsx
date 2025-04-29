import { Box, Flex, Link as NavLink } from '@radix-ui/themes'
import { useNavigate } from 'react-router'
import { useMemo } from 'react'

const
  Navigation = () => {
    const navigate = useNavigate()
    const navigationItems = useMemo(
        () => [
            {
                label: 'Workflows',
                to: '/admin/workflows',
            },
        ],
        []
    )
    return (
        <Flex gapY={'2'} direction={'column'}>
            {navigationItems.map((item, index) => (
                <Box key={index}>
                    <NavLink
                        href={item.to}
                        color="gray"
                        size="2"
                        onClick={(e) => {
                            e.preventDefault()
                            navigate(item.to)
                        }}
                    >
                        {item.label}
                    </NavLink>
                </Box>
            ))}
        </Flex>
    )
}

export default Navigation
