import Button from '@/components/ui/Button'
import {
    useAppDispatch,
    useAppSelector,
    setUsername,
    setEmail,
    setPhone,
    setPageIndex,
} from '../store'
import { Field, Form, Formik } from 'formik'
import { FormContainer, FormItem } from '@/components/ui/Form'
import { Input, Notification, toast } from '@/components/ui'
import { HiDownload, HiPlusCircle, HiSearch } from 'react-icons/hi'
import { useEffect, useMemo } from 'react'

const UserTableTools = () => {
    const dispatch = useAppDispatch()
    const { username, email, phone } = useAppSelector(
        (state) => state.users.data
    )
    const initialValues = useMemo(
        () => ({
            username: username || '',
            email: email || '',
            phone: phone || '',
        }),
        [username, email, phone]
    )
    const handleSearch = (values: any) => {
        dispatch(setUsername(values.username))
        dispatch(setEmail(values.email))
        dispatch(setPhone(values.phone))
        dispatch(setPageIndex(1))
    }

    return (
        <>
            <Formik initialValues={initialValues} onSubmit={handleSearch}>
                {({ values, isValid, dirty }) => (
                    <Form className="lg:my-3">
                        <FormContainer>
                            <div className="grid lg:grid-cols-4 md:grid-cols-2 md:gap-4 gap-2">
                                <FormItem
                                    label="Tên tài khoản"
                                    className="w-full"
                                >
                                    <Field
                                        name="username"
                                        type="text"
                                        placeholder="Tên tài khoản"
                                        autoComplete="off"
                                        component={Input}
                                    />
                                </FormItem>
                                <FormItem label="Email" className="w-full">
                                    <Field
                                        name="email"
                                        type="text"
                                        placeholder="Email"
                                        autoComplete="off"
                                        component={Input}
                                    />
                                </FormItem>
                                <FormItem
                                    label="Số điện thoại"
                                    className="w-full"
                                >
                                    <Field
                                        name="phone"
                                        type="text"
                                        placeholder="Số điện thoại"
                                        autoComplete="off"
                                        component={Input}
                                    />
                                </FormItem>
                            </div>
                            <div className="flex flex-col lg:flex-row gap-4 justify-end">
                                <Button
                                    variant="solid"
                                    color="blue-600"
                                    type="submit"
                                    className="w-full lg:w-auto"
                                    icon={<HiSearch />}
                                >
                                    Tìm kiếm
                                </Button>
                            </div>
                        </FormContainer>
                    </Form>
                )}
            </Formik>
        </>
    )
}

export default UserTableTools
