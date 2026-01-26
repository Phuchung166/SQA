import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { FormContainer } from '@/components/ui/Form'
import FormRow from './FormRow'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import { apiUpdateProfileInfo } from '@/services/AccountServices'
import { setUser, useAppDispatch, useAppSelector } from '@/store'
import { useTranslation } from 'react-i18next'

export type ProfileFormModel = {
    full_name?: string
    phone?: string
    email?: string
}

type ProfileProps = {
    data?: ProfileFormModel
}

const validationSchema = Yup.object().shape({
    full_name: Yup.string()
        .min(3, 'Tên quá ngắn!')
        .required('Tên không được để trống!'),
    phone: Yup.string().required('Số điện thoại không được để trống!'),
    email: Yup.string()
        .email('Email không đúng định dạng!')
        .required('Email không được để trống!'),
})

const Profile = ({
    data = {
        full_name: '',
        phone: '',
        email: '',
    },
}: ProfileProps) => {

    const { t } = useTranslation()

    const initialValues = {
        full_name: data.full_name || '',
        phone: data.phone || '',
        email: data.email || '',
    }

    const dispatch = useAppDispatch()
    const { avatar, authority } = useAppSelector(
        (state) => state.auth.user
    )
    const onFormSubmit = async (
        values: ProfileFormModel,
        setSubmitting: (isSubmitting: boolean) => void
    ) => {
        try {
            const response = await apiUpdateProfileInfo(values)
            if (response.data.code === 0) {
                dispatch(setUser({
                    fullName: values.full_name,
                    email: values.email,
                    avatar: avatar,
                    authority: authority,
                }))
                toast.push(
                    <Notification
                        title={'Cập nhật thông tin thành công'}
                        type="success"
                    />,
                    { placement: 'top-center' }
                )
            } else {
                toast.push(
                    <Notification
                        title={'Cập nhật thông tin thất bại'}
                        type="danger"
                    >
                        {response.data.message}
                    </Notification>,
                    { placement: 'top-center' }
                )
            }
        } catch (error: any) {
            toast.push(
                <Notification
                    title={'Cập nhật thông tin thất bại'}
                    type="danger"
                />,
                { placement: 'top-center' }
            )
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Formik
            enableReinitialize
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={(values, { setSubmitting }) => {
                setSubmitting(true)
                setTimeout(() => {
                    onFormSubmit(values, setSubmitting)
                }, 1000)
            }}
        >
            {({ values, touched, errors, isSubmitting, resetForm }) => {
                const validatorProps = { touched, errors }
                return (
                    <Form>
                        <FormContainer>
                            <FormRow
                                name="full_name"
                                label="Họ tên"
                                {...validatorProps}
                            >
                                <Field
                                    type="text"
                                    autoComplete="off"
                                    name="full_name"
                                    placeholder="Họ tên"
                                    component={Input}
                                />
                            </FormRow>
                            <FormRow
                                name="phone"
                                label="Số điện thoại"
                                {...validatorProps}
                            >
                                <Field
                                    type="text"
                                    autoComplete="off"
                                    name="phone"
                                    placeholder="Số điện thoại"
                                    component={Input}
                                />
                            </FormRow>
                            <FormRow
                                name="email"
                                label="Email"
                                {...validatorProps}
                            >
                                <Field
                                    type="text"
                                    autoComplete="off"
                                    name="email"
                                    placeholder="Email"
                                    component={Input}
                                    disabled
                                />
                            </FormRow>
                            <div className="flex justify-end items-center px-6 py-3  rounded-bl-lg rounded-br-lg space-x-2">
                                <Button
                                    variant="solid"
                                    loading={isSubmitting}
                                    type="submit"
                                >
                                    {isSubmitting
                                        ? t('action.updating')
                                        : t('action.update')}
                                </Button>
                            </div>
                        </FormContainer>
                    </Form>
                )
            }}
        </Formik>
    )
}

export default Profile
