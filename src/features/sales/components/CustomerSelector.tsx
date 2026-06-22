import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WALK_IN_CUSTOMER } from '@/features/sales/constants'
import type { SalesCustomerOption, CustomerMode } from '@/features/sales/types'

interface CustomerSelectorProps {
  mode: CustomerMode
  customerId: string
  name: string
  phone: string
  customers: SalesCustomerOption[]
  onModeChange: (mode: CustomerMode) => void
  onCustomerIdChange: (customerId: string) => void
  onNameChange: (name: string) => void
  onPhoneChange: (phone: string) => void
}

export function CustomerSelector({
  mode,
  customerId,
  name,
  phone,
  customers,
  onModeChange,
  onCustomerIdChange,
  onNameChange,
  onPhoneChange,
}: CustomerSelectorProps) {
  const handleModeChange = (nextMode: CustomerMode) => {
    onModeChange(nextMode)

    if (nextMode === 'walk_in') {
      onCustomerIdChange('')
      onNameChange(WALK_IN_CUSTOMER.name)
      onPhoneChange(WALK_IN_CUSTOMER.phone)
      return
    }

    if (nextMode === 'existing' && customers.length > 0) {
      onCustomerIdChange(customers[0].id)
      onNameChange(customers[0].name)
      onPhoneChange(customers[0].phone)
      return
    }

    if (nextMode === 'new') {
      onCustomerIdChange('')
      onNameChange('')
      onPhoneChange('')
    }
  }

  const handleExistingCustomerChange = (id: string) => {
    onCustomerIdChange(id)
    const selected = customers.find((customer) => customer.id === id)
    if (selected) {
      onNameChange(selected.name)
      onPhoneChange(selected.phone)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Customer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="customer-mode">Customer Type</Label>
          <Select
            id="customer-mode"
            value={mode}
            onChange={(event) => handleModeChange(event.target.value as CustomerMode)}
          >
            <option value="walk_in">Walk-In Customer</option>
            <option value="existing">Existing Customer</option>
            <option value="new">Create New Customer</option>
          </Select>
        </div>

        {mode === 'existing' ? (
          <div className="space-y-2">
            <Label htmlFor="existing-customer">Select Customer</Label>
            <Select
              id="existing-customer"
              value={customerId}
              onChange={(event) => handleExistingCustomerChange(event.target.value)}
            >
              <option value="">Select customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} · {customer.phone}
                </option>
              ))}
            </Select>
          </div>
        ) : null}

        {mode !== 'walk_in' ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="customer-name">Name</Label>
              <Input
                id="customer-name"
                value={name}
                onChange={(event) => onNameChange(event.target.value)}
                placeholder="Customer name"
                readOnly={mode === 'existing'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer-phone">Phone Number</Label>
              <Input
                id="customer-phone"
                value={phone}
                onChange={(event) => onPhoneChange(event.target.value)}
                placeholder="+233 XX XXX XXXX"
                readOnly={mode === 'existing'}
              />
            </div>
          </>
        ) : (
          <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
            {WALK_IN_CUSTOMER.name} — no details required.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
