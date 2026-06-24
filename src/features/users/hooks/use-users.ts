import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/api'
import type {
  CreateUserInput,
  ResetPasswordInput,
  UpdateUserInput,
  UserActivityFilters,
  UserListFilters,
} from '@/features/users/types'
import { userService } from '@/services/users/userService'

function invalidateUserQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] })
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS_SUMMARY] })
}

export function useUserStatistics() {
  return useQuery({
    queryKey: [QUERY_KEYS.USERS_SUMMARY],
    queryFn: () => userService.getUserStatistics(),
  })
}

export function useUsers(filters: UserListFilters) {
  return useQuery({
    queryKey: [QUERY_KEYS.USERS, filters],
    queryFn: () => userService.getUsers(filters),
  })
}

export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEYS.USERS, 'detail', id],
    queryFn: () => userService.getUserById(id!),
    enabled: Boolean(id),
  })
}

export function useUserActivity(userId: string | undefined, filters: UserActivityFilters) {
  return useQuery({
    queryKey: [QUERY_KEYS.USER_ACTIVITY, userId, filters],
    queryFn: () => userService.getUserActivity(userId!, filters),
    enabled: Boolean(userId),
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateUserInput) => userService.createUser(input),
    onSuccess: () => invalidateUserQueries(queryClient),
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserInput }) =>
      userService.updateUser(id, input),
    onSuccess: (_data, variables) => {
      invalidateUserQueries(queryClient)
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS, 'detail', variables.id] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER_ACTIVITY, variables.id] })
    },
  })
}

export function useSuspendUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => userService.suspendUser(id),
    onSuccess: (_data, id) => {
      invalidateUserQueries(queryClient)
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS, 'detail', id] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER_ACTIVITY, id] })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => invalidateUserQueries(queryClient),
  })
}

export function useResetPassword() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ResetPasswordInput }) =>
      userService.resetPassword(id, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER_ACTIVITY, variables.id] })
    },
  })
}
