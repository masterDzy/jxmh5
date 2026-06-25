'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import type { JmBookingFlowProps, BookingFlowState, BookingFlowStep } from './props'
import { BOOKING_FLOW_STEPS } from './props'
import { JmPlannerList } from '@/components/jmaui/components/content/JmPlannerList'
import type { PlannerItem } from '@/components/jmaui/components/content/JmPlannerList/props'
import { JmContactField } from '@/components/jmaui/components/functional/JmContactField'
import { JmTextarea } from '@/components/jmaui/components/functional/JmTextarea'
import { JmBookingSuccessCard } from '@/components/jmaui/components/content/JmBookingSuccessCard'
import { SPACE_LABEL_MAP } from '@/lib/delivery'
import type { DeliverySpace } from '@/lib/delivery'
import { post } from '@/lib/http'

const STEP_ORDER: BookingFlowStep[] = ['planner', 'time', 'info', 'confirm']

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function withinBounds(step: BookingFlowStep, current: BookingFlowStep): 'upcoming' | 'current' | 'done' {
  const si = STEP_ORDER.indexOf(step)
  const ci = STEP_ORDER.indexOf(current)
  if (si < ci) return 'done'
  if (si === ci) return 'current'
  return 'upcoming'
}

const validatePhone = (v: string) => /^1[3-9]\d{9}$/.test(v)
const validateName = (v: string) => v.trim().length >= 2

export function JmBookingFlow({
  serviceId,
  serviceName,
  onSuccess,
  onClose,
  themeColor = 'var(--jm-color-brand-vermilion, #D94E3D)',
  className = '',
}: JmBookingFlowProps) {
  const [state, setState] = useState<BookingFlowState>({
    plannerId: null,
    selectedPlanner: null,
    deliverySpace: null,
    deliveryForm: null,
    selectedDateIndex: null,
    selectedTime: null,
    name: '',
    phone: '',
    note: '',
    address: '',
    submitting: false,
    errorMsg: '',
  })
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [bookingId, setBookingId] = useState('')
  const showSuccess = bookingId !== ''
  const onSuccessCalled = useRef(false)

  useEffect(() => {
    if (showSuccess && !onSuccessCalled.current) {
      onSuccessCalled.current = true
    }
  }, [showSuccess])

  const nextDays = useMemo(() => {
    const days: Date[] = []
    const today = new Date()
    for (let i = 0; i < 14; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      days.push(d)
    }
    return days
  }, [])

  const set = <K extends keyof BookingFlowState>(key: K, value: BookingFlowState[K]) => {
    setState(prev => ({ ...prev, [key]: value }))
  }

  const timeSelected = state.selectedDateIndex !== null && !!state.selectedTime

  const isValid = state.plannerId !== null &&
    state.deliverySpace !== null &&
    timeSelected &&
    validateName(state.name)

  const currentStepId: BookingFlowStep = useMemo(() => {
    if (isValid) return 'confirm'
    if (timeSelected) return 'info'
    if (state.plannerId !== null && state.deliverySpace !== null) return 'time'
    return 'planner'
  }, [isValid, timeSelected, state.plannerId, state.deliverySpace])

  const handlePlannerSelect = useCallback((p: PlannerItem) => {
    setState(prev => ({
      ...prev,
      plannerId: p.id,
      selectedPlanner: p,
      deliverySpace: null,
      deliveryForm: null,
      address: '',
    }))
  }, [])

  const handleSubmit = async () => {
    setTouched({ name: true, phone: true })
    if (!isValid || state.plannerId === null || state.deliverySpace === null) {
      setState(prev => ({ ...prev, errorMsg: '请完整填写所有必填项' }))
      return
    }

    setState(prev => ({ ...prev, submitting: true, errorMsg: '' }))

    try {
      const dateStr = state.selectedDateIndex !== null
        ? `${nextDays[state.selectedDateIndex].getFullYear()}-${String(nextDays[state.selectedDateIndex].getMonth() + 1).padStart(2, '0')}-${String(nextDays[state.selectedDateIndex].getDate()).padStart(2, '0')}`
        : ''

      const json = await post('/api/v1/mobile/appointments', {
        service_id: serviceId,
        service_name: serviceName,
        service_category: null,
        planner_id: state.plannerId,
        delivery_space: state.deliverySpace,
        delivery_form: null,
        name: state.name.trim(),
        phone: state.phone.trim(),
        appointment_date: dateStr,
        appointment_time: state.selectedTime ?? '',
        note: state.note.trim() || null,
      })

      if (json.error) {
        throw new Error(json.message || '提交失败')
      }

      setBookingId(String(json.data?.id ?? ''))
    } catch (e: unknown) {
      setState(prev => ({
        ...prev,
        submitting: false,
        errorMsg: e instanceof Error ? e.message : '提交失败，请稍后重试',
      }))
    }
  }

  const formatDate = (d: Date) => {
    const m = d.getMonth() + 1
    const day = d.getDate()
    const w = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()]
    return `${m}月${day}日 周${w}`
  }

  return (
    <div className={`jm-bf ${className}`} style={{ '--bs-color': themeColor } as React.CSSProperties}>
      <div className="jm-bf-stepper">
        {BOOKING_FLOW_STEPS.map((step, idx) => {
          const status = showSuccess ? 'done' : withinBounds(step.id, currentStepId)
          return (
            <span key={step.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {idx > 0 && (
                <span className={`jm-bf-connector ${(showSuccess || STEP_ORDER.indexOf(currentStepId) >= idx) ? 'jm-bf-connector--done' : ''}`} />
              )}
              <span className={`jm-bf-step ${status === 'current' ? 'jm-bf-step--current' : ''} ${status === 'done' ? 'jm-bf-step--done' : ''}`}>
                <span className="jm-bf-step__dot">
                  {status === 'done' ? <CheckIcon /> : idx + 1}
                </span>
                <span className="jm-bf-step__label">{step.label}</span>
              </span>
            </span>
          )
        })}
      </div>

      {showSuccess ? (
        <JmBookingSuccessCard
          serviceName={serviceName}
          resetLabel="返回"
          plannerName={state.selectedPlanner?.name ?? ''}
          plannerAvatar={state.selectedPlanner?.avatar_url ?? undefined}
          plannerSpecialty={state.selectedPlanner?.specialty ?? undefined}
          plannerDescription={state.selectedPlanner?.description ?? undefined}
          deliveryLabel={state.deliverySpace ? SPACE_LABEL_MAP[state.deliverySpace] : ''}
          bookerName={state.name}
          bookerPhone={state.phone}
          appointmentTime={
            state.selectedDateIndex !== null
              ? `${formatDate(nextDays[state.selectedDateIndex])} ${state.selectedTime ?? ''}`
              : ''
          }
          note={state.note || undefined}
          address={state.address || undefined}
          themeColor={themeColor}
          onReset={() => { onSuccess?.(); onClose?.() }}
        />
      ) : (
        <>
          <JmPlannerList
            themeColor={themeColor}
            selectedPlannerId={state.plannerId}
            selectedDeliverySpace={state.deliverySpace}
            onPlannerSelect={handlePlannerSelect}
            onDeliverySpaceChange={(s: DeliverySpace) => set('deliverySpace', s)}
            dates={nextDays}
            selectedDateIndex={state.selectedDateIndex}
            selectedTime={state.selectedTime}
            onDateChange={(i: number) => set('selectedDateIndex', i)}
            onTimeChange={(t: string) => set('selectedTime', t)}
            address={state.address}
            onAddressChange={(v: string) => set('address', v)}
          />

          {timeSelected && (
        <>
          <div className="jm-bf-summary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--bs-color, #D94E3D)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="jm-bf-summary__text">
              已为 <strong>{state.selectedPlanner?.name ?? ''}</strong> 老师锁定{' '}
              {state.selectedDateIndex !== null ? formatDate(nextDays[state.selectedDateIndex]) : ''} {state.selectedTime ?? ''}
              {state.deliverySpace ? ` · ${SPACE_LABEL_MAP[state.deliverySpace]}` : ''}
            </span>
          </div>

          <div className="jm-bf-section">
            <div className="jm-bf-section__title jm-bf-section__title--active">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>联系方式</span>
              <span className="jm-bf-required">*</span>
            </div>
            <div className="jm-bf-contact-row">
              <div className="jm-bf-contact-fields">
                <JmContactField
                  type="text"
                  label="姓名"
                  required
                  autoFocus
                  value={state.name}
                  onChange={(v: string) => { set('name', v); setTouched(prev => ({ ...prev, name: true })) }}
                  placeholder="请输入您的姓名"
                  error={touched.name && !validateName(state.name) ? '请输入真实姓名（至少2字）' : ''}
                />
                <JmContactField
                  type="tel"
                  label="手机号"
                  required={false}
                  value={state.phone}
                  onChange={(v: string) => { set('phone', v); setTouched(prev => ({ ...prev, phone: true })) }}
                  placeholder=""
                  error={touched.phone && state.phone.trim() !== '' && !validatePhone(state.phone) ? '请输入有效手机号' : ''}
                />
              </div>
              <div className="jm-bf-contact-qr">
                <div className="jm-bf-contact-qr-inner">
                  <img src="/assets/qw.jpg" alt="企业微信二维码" className="jm-bf-qr-img" />
                  <span className="jm-bf-qr-hint">长按保存 → 微信扫一扫</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <JmTextarea
                value={state.note}
                onChange={(v: string) => set('note', v)}
                placeholder="请描述您想咨询的问题或需求…"
                label="备注（选填）"
              />
            </div>
          </div>

          {state.errorMsg && (
            <div className="jm-bf-error">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {state.errorMsg}
            </div>
          )}

          <button
            type="button"
            className="jm-bf-btn--submit"
            disabled={state.submitting}
            onClick={handleSubmit}
          >
            {state.submitting ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                </svg>
                提交中...
              </span>
            ) : '确认预约'}
          </button>

          <p style={{ textAlign: 'center', fontSize: 12, color: '#999', marginTop: 8 }}>
            预约成功后，客服将在2小时内与您联系确认
          </p>
        </>
      )}
    </>
  )}
    </div>
  )
}

export default JmBookingFlow
