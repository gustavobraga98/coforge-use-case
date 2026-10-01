import type { ButtonHTMLAttributes, HTMLAttributes, PropsWithChildren } from 'react'

type SurfaceProps = PropsWithChildren<{
  as?: 'aside' | 'section'
  className?: string
  label: string
}>

export function Surface({ as: Tag = 'section', className = '', label, children }: SurfaceProps) {
  return <Tag className={`surface ${className}`} aria-label={label}>{children}</Tag>
}

type BadgeProps = PropsWithChildren<{ tone?: 'accent' | 'muted' }>

export function Badge({ children, tone = 'accent' }: BadgeProps) {
  return <span className={`badge badge--${tone}`}>{children}</span>
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { tone?: 'primary' | 'quiet' }

export function Button({ tone = 'primary', className = '', ...props }: ButtonProps) {
  return <button className={`button button--${tone} ${className}`} {...props} />
}

type CardProps = PropsWithChildren<HTMLAttributes<HTMLDivElement> & { label: string }>

export function Card({ children, className = '', label, ...props }: CardProps) {
  return <div className={`card ${className}`} aria-label={label} {...props}>{children}</div>
}
