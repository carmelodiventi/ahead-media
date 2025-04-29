import { Box } from '@radix-ui/themes'
import { PageTemplateProps } from './PageTemplate.types'
import Header from "../header";

const PageTemplate = ({ headerData, userData, children }: PageTemplateProps) => {
    return (
        <Box>
            <Header headerData={headerData} userData={userData} />
            {children}
        </Box>
    )
}

export default PageTemplate
