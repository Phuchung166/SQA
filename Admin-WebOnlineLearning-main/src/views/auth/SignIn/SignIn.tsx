import { useTranslation } from 'react-i18next'
import SignInForm from './SignInForm'

const SignIn = () => {
    const { t } = useTranslation()
    return (
        <>
            <div className="mb-8">
                <h3 className="mb-1">{t('auth.signIn.welcomeBack')}</h3>
                <p>{t('auth.signIn.pleaseEnterYourCredentials')}</p>
            </div>
            <SignInForm disableSubmit={false} />
        </>
    )
}

export default SignIn
