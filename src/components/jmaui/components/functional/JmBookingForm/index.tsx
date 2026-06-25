'use client'

import { useState, useCallback, useMemo } from 'react'
import { JmPlannerList } from '@/components/jmaui/components/content/JmPlannerList'
import type { PlannerItem } from '@/components/jmaui/components/content/JmPlannerList/props'
import { JmContactField } from '@/components/jmaui/components/functional/JmContactField'
import { JmTextarea } from '@/components/jmaui/components/functional/JmTextarea'
import { JmBookingSuccessCard } from '@/components/jmaui/components/content/JmBookingSuccessCard'
import { JmAppointmentTips } from '@/components/jmaui/components/functional/JmAppointmentTips'
import { SPACE_LABEL_MAP, type DeliverySpace } from '@/lib/delivery'
import { post } from '@/lib/http'

export interface JmBookingFormProps {
  themeColor?: string
  onSuccess?: () => void
}

type Status = 'idle' | 'submitting' | 'success' | 'error'

const validatePhone = (v: string) => /^1[3-9]\d{9}$/.test(v)
const validateName = (v: string) => v.trim().length >= 2

function formatDate(d: Date) {
  const m = d.getMonth() + 1
  const day = d.getDate()
  const w = ['日','一','二','三','四','五','六'][d.getDay()]
  return `${m}月${day}日 周${w}`
}

export default function JmBookingForm({
  themeColor = 'var(--jm-color-brand-vermilion, #D94E3D)',
  onSuccess,
}: JmBookingFormProps) {
  const [plannerId, setPlannerId] = useState<number | null>(null)
  const [selectedPlanner, setSelectedPlanner] = useState<PlannerItem | null>(null)
  const [deliverySpace, setDeliverySpace] = useState<DeliverySpace | null>(null)
  const [address, setAddress] = useState('')

  const handlePlannerSelect = useCallback((p: PlannerItem) => {
    setSelectedPlanner(p)
    setPlannerId(p.id)
    setDeliverySpace(null)
    setAddress('')
  }, [])

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

  const [selectedDateIndex, setSelectedDateIndex] = useState<number | null>(null)
  const [selectedTime, setSelectedTime] = useState('')

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [note, setNote] = useState('')
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const firstStepReady = plannerId !== null && deliverySpace !== null
  const timeSelected = selectedDateIndex !== null && !!selectedTime

  const isValid =
    plannerId !== null &&
    deliverySpace !== null &&
    validateName(name) &&
    selectedDateIndex !== null &&
    !!selectedTime

  const currentStepId = useMemo(() => {
    if (isValid) return 'confirm'
    if (timeSelected) return 'info'
    if (firstStepReady) return 'time'
    return 'planner'
  }, [isValid, timeSelected, firstStepReady])

  const errors = {
    name: touched.name && !validateName(name) ? '请输入真实姓名（至少2字）' : '',
    phone: touched.phone && phone.trim() !== '' && !validatePhone(phone) ? '请输入有效手机号' : '',
  }

  const handleSubmit = async () => {
    setTouched({ name: true, phone: true })
    if (!isValid) {
      setStatus('error')
      setErrorMsg('请完整填写必填信息')
      return
    }

    setStatus('submitting')
    setErrorMsg('')

    try {
      const dateStr = selectedDateIndex !== null
        ? `${nextDays[selectedDateIndex].getFullYear()}-${String(
            nextDays[selectedDateIndex].getMonth() + 1
          ).padStart(2, '0')}-${String(nextDays[selectedDateIndex].getDate()).padStart(2, '0')}`
        : ''

      const json = await post('/api/v1/mobile/appointments', {
        service_id: null,
        service_name: '',
        service_category: null,
        planner_id: plannerId,
        delivery_space: deliverySpace,
        delivery_form: null,
        name: name.trim(),
        phone: phone.trim(),
        appointment_date: dateStr,
        appointment_time: selectedTime,
        note: note.trim() || null,
      })
      if (json.error) {
        throw new Error(json.message || '提交失败')
      }
      setStatus('success')
      onSuccess?.()
    } catch (e: unknown) {
      setStatus('error')
      setErrorMsg(e instanceof Error ? e.message : '提交失败，请稍后重试')
    }
  }

  const handleReset = () => {
    setPlannerId(null)
    setSelectedPlanner(null)
    setDeliverySpace(null)
    setAddress('')
    setName('')
    setPhone('')
    setSelectedDateIndex(null)
    setSelectedTime('')
    setNote('')
    setStatus('idle')
    setErrorMsg('')
    setTouched({})
  }

  if (status === 'success') {
    return (
      <div className="jm-booking-card">
        <JmBookingSuccessCard
          serviceName=""
          plannerName={selectedPlanner?.name ?? ''}
          plannerAvatar={selectedPlanner?.avatar_url ?? undefined}
          plannerSpecialty={selectedPlanner?.specialty ?? undefined}
          plannerDescription={selectedPlanner?.description ?? undefined}
          deliveryLabel={deliverySpace ? SPACE_LABEL_MAP[deliverySpace] : ''}
          bookerName={name}
          bookerPhone={phone}
          appointmentTime={
            selectedDateIndex !== null
              ? `${formatDate(nextDays[selectedDateIndex])} ${selectedTime}`
              : ''
          }
          note={note || undefined}
          address={address || undefined}
          themeColor={themeColor}
          onReset={handleReset}
        />
      </div>
    )
  }

  return (
    <>
      <JmAppointmentTips currentStepId={currentStepId} />

      <div className="jm-booking-card">
        <div className={`jm-form-card-title mb-3 ${firstStepReady ? 'jm-form-card-title--active' : ''}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>选择策划师与交付</span>
          <span className="jm-form-card-required">*</span>
        </div>
        <JmPlannerList
          themeColor={themeColor}
          selectedPlannerId={plannerId}
          selectedDeliverySpace={deliverySpace}
          onPlannerSelect={handlePlannerSelect}
          onDeliverySpaceChange={setDeliverySpace}
          dates={nextDays}
          selectedDateIndex={selectedDateIndex}
          selectedTime={selectedTime}
          onDateChange={setSelectedDateIndex}
          onTimeChange={setSelectedTime}
          address={address}
          onAddressChange={setAddress}
        />
      </div>

      {firstStepReady && (
        <>
          {selectedDateIndex !== null && selectedTime && (
            <div className="jm-bf-summary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={themeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="jm-bf-summary__text">
                已为 <strong>{selectedPlanner?.name ?? ''}</strong> 老师锁定{' '}
                {formatDate(nextDays[selectedDateIndex])} {selectedTime}
                {deliverySpace ? ` · ${SPACE_LABEL_MAP[deliverySpace]}` : ''}
              </span>
            </div>
          )}

          <div className="jm-booking-card">
            <div className={`jm-form-card-title mb-3 ${validateName(name) ? 'jm-form-card-title--active' : ''}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>联系方式</span>
              <span className="jm-form-card-required">*</span>
            </div>
            <div className="jm-bf-contact-row">
              <div className="jm-bf-contact-fields">
                <JmContactField
                  type="text" label="姓名" required autoFocus
                  value={name} onChange={setName}
                  placeholder="请输入您的姓名"
                  error={errors.name}
                />
                <JmContactField
                  type="tel" label="手机号" required={false}
                  value={phone} onChange={setPhone}
                  placeholder=""
                  error={errors.phone}
                />
              </div>
              <div className="jm-bf-contact-qr">
                <div className="jm-bf-contact-qr-inner">
                  <img src="/assets/qw.jpg" alt="企业微信二维码" className="jm-bf-qr-img" />
                  <span className="jm-bf-qr-hint">长按保存 → 微信扫一扫</span>
                </div>
              </div>
            </div>
          </div>

          <div className="jm-booking-card">
            <div className={`jm-form-card-title mb-3 ${note.trim() ? 'jm-form-card-title--active' : ''}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>备注</span>
            </div>
            <JmTextarea
              value={note} onChange={setNote}
              placeholder="请描述您想咨询的问题或需求..."
              label="备注（选填）"
            />
          </div>

          {status === 'error' && errorMsg && (
            <div className="jm-booking-error">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D94E3D" strokeWidth="2" className="jm-booking-error__icon">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="jm-booking-error__text">{errorMsg}</p>
            </div>
          )}

          <button
            type="button"
            className="jm-bf-btn--submit"
            disabled={status === 'submitting'}
            onClick={handleSubmit}
          >
            {status === 'submitting' ? (
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
  )
}
