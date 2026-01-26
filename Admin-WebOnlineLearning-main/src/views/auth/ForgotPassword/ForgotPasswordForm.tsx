import { useState } from 'react'
import { FormItem, FormContainer } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import ActionLink from '@/components/shared/ActionLink'
import { apiForgotPassword } from '@/services/AuthService'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import type { CommonProps } from '@/@types/common'
import type { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'

interface ForgotPasswordFormProps extends CommonProps {
    disableSubmit?: boolean
    signInUrl?: string
}

type ForgotPasswordFormSchema = {
    username: string
    email: string
}

const ForgotPasswordForm = (props: ForgotPasswordFormProps) => {
    const { t } = useTranslation()
    const { disableSubmit = false, className, signInUrl = '/sign-in' } = props

    const [emailSent, setEmailSent] = useState(false)

    const [message, setMessage] = useTimeOutMessage()

    const validationSchema = Yup.object().shape({
        email: Yup.string().required(
            t('auth.common.emailRequired') || 'Please enter your email'
        ),
        username: Yup.string().required(
            t('auth.common.userNameRequired') || 'Please enter your username'
        ),
    })

    const onSendMail = async (
        values: ForgotPasswordFormSchema,
        setSubmitting: (isSubmitting: boolean) => void
    ) => {
        setSubmitting(true)
        try {
            const resp = await apiForgotPassword(values)
            if (resp.data.code === 0) {
                setSubmitting(false)
                setEmailSent(true)
            } else {
                setMessage(resp.data.message)
                setSubmitting(false)
            }
        } catch (errors) {
            setMessage(
                (errors as AxiosError<{ message: string }>)?.response?.data
                    ?.message || (errors as Error).toString()
            )
            setSubmitting(false)
        }
    }

    return (
        <div className={className}>
            <div className="mb-6">
                {emailSent ? (
                    <>
                        <h3 className="mb-1">
                            {t('auth.forgotPassword.checkYourEmail')}
                        </h3>
                        <p>{t('auth.forgotPassword.emailSent')}</p>
                    </>
                ) : (
                    <>
                        <h3 className="mb-1">
                            {t('auth.forgotPassword.title')}
                        </h3>
                        <p>{t('auth.forgotPassword.forgotPasswordText')}</p>
                    </>
                )}
            </div>
            {message && (
                <Alert showIcon className="mb-4" type="danger">
                    {message}
                </Alert>
            )}
            <Formik
                initialValues={{ email: '', username: '' }}
                validationSchema={validationSchema}
                onSubmit={(values, { setSubmitting }) => {
                    if (!disableSubmit) {
                        onSendMail(values, setSubmitting)
                    } else {
                        setSubmitting(false)
                    }
                }}
            >
                {({ touched, errors, isSubmitting }) => (
                    <Form>
                        <FormContainer>
                            <div className={emailSent ? 'hidden' : ''}>
                                <FormItem
                                    invalid={errors.email && touched.email}
                                    errorMessage={errors.email}
                                >
                                    <Field
                                        type="email"
                                        autoComplete="off"
                                        name="email"
                                        placeholder="Email"
                                        component={Input}
                                    />
                                </FormItem>
                                <FormItem
                                    invalid={
                                        errors.username && touched.username
                                    }
                                    errorMessage={errors.username}
                                >
                                    <Field
                                        type="username"
                                        autoComplete="off"
                                        name="username"
                                        placeholder="Username"
                                        component={Input}
                                    />
                                </FormItem>
                            </div>
                            <Button
                                block
                                loading={isSubmitting}
                                variant="solid"
                                type="submit"
                            >
                                {emailSent
                                    ? t('auth.forgotPassword.resendEmail')
                                    : t('auth.forgotPassword.sendEmail')}
                            </Button>
                            <div className="mt-4 text-center">
                                <span>{t('auth.forgotPassword.backTo')} </span>
                                <ActionLink to={signInUrl}>
                                    {t('auth.common.signIn')}
                                </ActionLink>
                            </div>
                        </FormContainer>
                    </Form>
                )}
            </Formik>
        </div>
    )
}

export default ForgotPasswordForm
