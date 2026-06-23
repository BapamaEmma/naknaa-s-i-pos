import { CreateUserForm } from '@/features/users/components/CreateUserForm'
import { EditUserForm } from '@/features/users/components/EditUserForm'
import type { CreateUserFormOutput, EditUserFormOutput } from '@/features/users/schemas/user.schema'
import type { UserDetail } from '@/features/users/types'

interface UserFormProps {
  mode: 'create'
  isSubmitting?: boolean
  submitLabel?: string
  onSubmit: (values: CreateUserFormOutput) => Promise<void>
}

interface EditUserFormProps {
  mode: 'edit'
  user: UserDetail
  isSubmitting?: boolean
  submitLabel?: string
  onSubmit: (values: EditUserFormOutput) => Promise<void>
}

export function UserForm(props: UserFormProps | EditUserFormProps) {
  if (props.mode === 'create') {
    return (
      <CreateUserForm
        isSubmitting={props.isSubmitting}
        submitLabel={props.submitLabel}
        onSubmit={props.onSubmit}
      />
    )
  }

  return (
    <EditUserForm
      user={props.user}
      isSubmitting={props.isSubmitting}
      submitLabel={props.submitLabel}
      onSubmit={props.onSubmit}
    />
  )
}
