import { User } from '@supabase/auth-js'
import { ReactElement } from 'react'
import {CMSData} from "../../../utils/contentful/contentful.types";

export type PageTemplateProps = {
    headerData: CMSData['pageData']['header']
    userData: User
    children: ReactElement
}
