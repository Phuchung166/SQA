import { FormItem, FormContainer } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import PasswordInput from '@/components/shared/PasswordInput'
import ActionLink from '@/components/shared/ActionLink'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import useAuth from '@/utils/hooks/useAuth'
import type { CommonProps } from '@/@types/common'
import { useTranslation } from 'react-i18next'

interface SignUpFormProps extends CommonProps {
    disableSubmit?: boolean
    signInUrl?: string
}

type SignUpFormSchema = {
    userName: string
    password: string
    email: string
}

const SignUpForm = (props: SignUpFormProps) => {
    const { disableSubmit = false, className, signInUrl = '/sign-in' } = props
    const { t } = useTranslation()
    const { signUp } = useAuth()

    const [message, setMessage] = useTimeOutMessage()

    const validationSchema = Yup.object().shape({
        userName: Yup.string().required(
            t('auth.common.userNameRequired') || 'Please enter your user name'
        ),
        email: Yup.string()
            .email(t('auth.common.emailInvalid') || 'Invalid email')
            .required(
                t('auth.common.emailRequired') || 'Please enter your email'
            ),
        password: Yup.string().required(
            t('auth.common.passwordRequired') || 'Please enter your password'
        ),
        confirmPassword: Yup.string().oneOf(
            [Yup.ref('password')],
            t('auth.common.confirmPasswordMatch') ||
                'Your passwords do not match'
        ),
    })

    const onSignUp = async (
        values: SignUpFormSchema,
        setSubmitting: (isSubmitting: boolean) => void
    ) => {
        const { userName, password, email } = values
        setSubmitting(true)
        const result = await signUp({ username:userName, password, email })

        if (result?.status === 'failed') {
            setMessage(result.message)
        }

        setSubmitting(false)
    }

    return (
        <div className={className}>
            {message && (
                <Alert showIcon className="mb-4" type="danger">
                    {message}
                </Alert>
            )}
            <Formik
                initialValues={{
                    userName: 'admin1',
                    password: '123Qwe1',
                    confirmPassword: '123Qwe1',
                    email: 'test@testmail.com',
                }}
                validationSchema={validationSchema}
                onSubmit={(values, { setSubmitting }) => {
                    if (!disableSubmit) {
                        onSignUp(values, setSubmitting)
                    } else {
                        setSubmitting(false)
                    }
                }}
            >
                {({ touched, errors, isSubmitting }) => (
                    <Form>
                        <FormContainer>
                            <FormItem
                                label={t('auth.common.userName') || 'User Name'}
                                invalid={errors.userName && touched.userName}
                                errorMessage={errors.userName}
                            >
                                <Field
                                    type="text"
                                    autoComplete="off"
                                    name="userName"
                                    placeholder={
                                        t('auth.common.userName') || 'User Name'
                                    }
                                    component={Input}
                                />
                            </FormItem>
                            <FormItem
                                label={t('auth.common.email') || 'Email'}
                                invalid={errors.email && touched.email}
                                errorMessage={errors.email}
                            >
                                <Field
                                    type="email"
                                    autoComplete="off"
                                    name="email"
                                    placeholder={
                                        t('auth.common.email') || 'Email'
                                    }
                                    component={Input}
                                />
                            </FormItem>
                            <FormItem
                                label={t('auth.common.password') || 'Password'}
                                invalid={errors.password && touched.password}
                                errorMessage={errors.password}
                            >
                                <Field
                                    autoComplete="off"
                                    name="password"
                                    placeholder={
                                        t('auth.common.password') || 'Password'
                                    }
                                    component={PasswordInput}
                                />
                            </FormItem>
                            <FormItem
                                label={
                                    t('auth.common.confirmPassword') ||
                                    'Confirm Password'
                                }
                                invalid={
                                    errors.confirmPassword &&
                                    touched.confirmPassword
                                }
                                errorMessage={errors.confirmPassword}
                            >
                                <Field
                                    autoComplete="off"
                                    name="confirmPassword"
                                    placeholder={
                                        t('auth.common.confirmPassword') ||
                                        'Confirm Password'
                                    }
                                    component={PasswordInput}
                                />
                            </FormItem>
                            <Button
                                block
                                loading={isSubmitting}
                                variant="solid"
                                type="submit"
                            >
                                {isSubmitting
                                    ? t('auth.signUp.signingUp')
                                    : t('auth.common.signUp')}
                            </Button>
                            <div className="mt-4 text-center">
                                <span>
                                    {t('auth.signUp.alreadyHaveAccount')}{' '}
                                </span>
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

export default SignUpForm
