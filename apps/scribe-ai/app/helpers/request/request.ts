import axios, {AxiosRequestConfig, AxiosResponse} from 'axios'

const request = async <T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
  try {
    return await axios(config)
  } catch (error) {
    throw new Error((error as Error).message)
  }
}

export default request
