import { toast as sonnerToast } from "sonner"

interface ToastProps {
  title?: string
  description?: string
  variant?: 'default' | 'destructive' | 'success'
}

export const useToast = () => {
  const toast = ({ title, description, variant = 'default' }: ToastProps) => {
    const message = title || description || ''
    const options = {
      description: title && description ? description : undefined,
    }

    switch (variant) {
      case 'destructive':
        return sonnerToast.error(message, options)
      case 'success':
        return sonnerToast.success(message, options)
      default:
        return sonnerToast(message, options)
    }
  }

  return { toast }
}