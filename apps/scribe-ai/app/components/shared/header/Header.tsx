import { Flex, Link, Separator } from '@radix-ui/themes'
import { useNavigate } from 'react-router'
import {PageTemplateProps} from "../pageTemplate/PageTemplate.types";
import {HeaderWrapper} from "./Header.styles";
import Logo from "./components/Logo";
import Navigation from "./components/Navigation";

const Header = ({ headerData, userData }: Pick<PageTemplateProps, 'headerData' | 'userData'>) => {
    const navigate = useNavigate()

    const { fields } = headerData

    return (
        <HeaderWrapper>
            <Flex align="center" justify="between" direction="row" px="4" py="4">
                <Flex gap="4" align="center" direction="row">
                    <Logo />
                    <Separator orientation="vertical" />
                </Flex>
                <Flex gap="4" align="center" direction="row">
                    <Navigation links={fields.links} />
                    {userData?.email ? (
                        <>
                            <Separator orientation="vertical" />
                            <Link
                                href="/app/dashboard"
                                size={'2'}
                                color={'gray'}
                                onClick={(e) => {
                                    e.preventDefault()
                                    navigate('/app/dashboard')
                                }}
                            >
                                Dashboard
                            </Link>
                        </>
                    ) : null}
                </Flex>
            </Flex>
        </HeaderWrapper>
    )
}

export default Header
