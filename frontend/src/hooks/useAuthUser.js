import { useQuery } from '@tanstack/react-query'
import { getAuthUser } from '../lib/api'
const useAuthUser = () => {
  const authUser = useQuery({
    queryKey:["authUser"],
    queryFn: getAuthUser,
    retry:false //auth check,it will prevent from rechecking again and again (unauthorized means unauthorized no further check)
  })

  return { isLoading: authUser.isLoading, authUser: authUser.data?.user} 
}

export default useAuthUser