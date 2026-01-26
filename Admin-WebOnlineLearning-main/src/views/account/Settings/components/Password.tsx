import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { FormContainer } from '@/components/ui/Form'
import FormDescription from './FormDescription'
import FormRow from './FormRow'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import { apiChangePassword } from '@/services/AccountServices'
import useAuth from '@/utils/hooks/useAuth'
import { ChangePassword } from '@/@types/profile'

const validationSchema = Yup.object().shape({
    old_password: Yup.string().required('Yêu cầu nhập mật khẩu hiện tại'),
    new_password: Yup.string()
        .required('Nhập mật khẩu mới')
        .min(8, 'Ít nhất 8 kí tự!')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            'Mật khẩu phải có ít nhất 8 kí tự, 1 chữ cái viết hoa, 1 chữ cái viết thường, 1 số và 1 kí tự đặc biệt'
        ),
    confirm_new_password: Yup.string()
        .nullable()
        .when('new_password', {
            is: (new_password: string) =>
                new_password && new_password.length > 0,
            then: (schema) =>
                schema
                    .required('Xác nhận mật khẩu không được để trống')
                    .oneOf(
                        [Yup.ref('new_password')],
                        'Mật khẩu xác nhận không khớp'
                    ),
            otherwise: (schema) => schema.nullable(),
        }),
})

const Password = () => {
    const { signOut } = useAuth()

    const onFormSubmit = async (
        values: ChangePassword,
        setSubmitting: (isSubmitting: boolean) => void
    ) => {
        try {
            setSubmitting(true)

            const response = await apiChangePassword(values)
            if (response.data.code === 0) {
                const countdown = 3
                toast.push(
                    <Notification
                        title={`Cập nhật mật khẩu thành công. Quay về trang đăng nhập sau ${countdown}s`}
                        type="success"
                    />,
                    {
                        placement: 'top-center',
                    }
                )

                setTimeout(() => {
                    signOut()
                }, countdown * 1000)

                setSubmitting(false)
            } else {
                toast.push(
                    <Notification
                        title={'Có lỗi khi cập nhật mật khẩu'}
                        type="danger"
                    >
                        {response.data.message}
                    </Notification>,
                    {
                        placement: 'top-center',
                    }
                )
                setSubmitting(false)
            }
        } catch (error: any) {
            toast.push(
                <Notification
                    title={'Có lỗi khi cập nhật mật khẩu'}
                    type="danger"
                >
                    {error.response.data.message}
                </Notification>,
                {
                    placement: 'top-center',
                }
            )
            setSubmitting(false)
        }
    }

    return (
        <>
            <Formik
                initialValues={{
                    old_password: '',
                    new_password: '',
                    confirm_new_password: '',
                }}
                validationSchema={validationSchema}
                onSubmit={(values, { setSubmitting }) => {
                    setSubmitting(true)
                    onFormSubmit(values, setSubmitting)
                }}
            >
                {({ touched, errors, isSubmitting, resetForm }) => {
                    const validatorProps = { touched, errors }
                    return (
                        <Form>
                            <FormContainer>
                                <FormDescription
                                    title="Mật khẩu"
                                    desc="Đặt lại mật khẩu của tài khoản"
                                />
                                <FormRow
                                    name="old_password"
                                    label="Mật khẩu hiện tại"
                                    {...validatorProps}
                                >
                                    <Field
                                        type="password"
                                        autoComplete="off"
                                        name="old_password"
                                        placeholder="Mật khẩu cũ"
                                        component={Input}
                                    />
                                </FormRow>
                                <FormRow
                                    name="new_password"
                                    label="Mật khẩu mới"
                                    {...validatorProps}
                                >
                                    <Field
                                        type="password"
                                        autoComplete="off"
                                        name="new_password"
                                        placeholder="Mật khẩu mới"
                                        component={Input}
                                        className="mb-6 lg:mb-0"
                                    />
                                </FormRow>
                                <FormRow
                                    name="confirm_new_password"
                                    label="Xác nhận mật khẩu mới"
                                    {...validatorProps}
                                >
                                    <Field
                                        type="password"
                                        autoComplete="off"
                                        name="confirm_new_password"
                                        placeholder="Xác nhận mật khẩu mới"
                                        component={Input}
                                    />
                                </FormRow>
                                <div className="mt-4 ltr:text-right">
                                    <Button
                                        className="ltr:mr-2 rtl:ml-2"
                                        type="button"
                                        onClick={() => resetForm()}
                                    >
                                        Đặt lại
                                    </Button>
                                    <Button
                                        variant="solid"
                                        loading={isSubmitting}
                                        type="submit"
                                    >
                                        {isSubmitting
                                            ? 'Đang cập nhật'
                                            : 'Cập nhật'}
                                    </Button>
                                </div>
                            </FormContainer>
                        </Form>
                    )
                }}
            </Formik>
        </>
    )
}

export default Password
