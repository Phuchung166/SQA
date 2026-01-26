import { useTranslation } from 'react-i18next'
import SignUpForm from './SignUpForm'

const SignUp = () => {
    const { t } = useTranslation()
    return (
        <>
            <div className="mb-8">
                <h3 className="mb-1">
                    {t('auth.signUp.title')}
                </h3>
                <p>{t('auth.signUp.letGetStarted')}</p>
            </div>
            <SignUpForm disableSubmit={false} />
        </>
    )
}

export default SignUp
