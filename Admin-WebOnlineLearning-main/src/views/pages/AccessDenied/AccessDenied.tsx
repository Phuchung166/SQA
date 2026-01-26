import Container from '@/components/shared/Container'
import DoubleSidedImage from '@/components/shared/DoubleSidedImage'
import { useTranslation } from 'react-i18next'

const AccessDenied = () => {
    const { t } = useTranslation()
    return (
        <Container className="h-full">
            <div className="h-full flex flex-col items-center justify-center">
                <DoubleSidedImage
                    src="/learning-cms/img/others/learning-cms/img-2.png"
                    darkModeSrc="/learning-cms/img/others/learning-cms/img-2-dark.png"
                    alt="Access Denied!"
                />
                <div className="mt-6 text-center">
                    <h3 className="mb-2">{t('permission.accessDenied')}!</h3>
                    <p className="text-base">
                        {t('permission.accessDeniedText')}
                    </p>
                </div>
            </div>
        </Container>
    )
}

export default AccessDenied
