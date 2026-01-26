import { DoubleSidedImage, Container } from '@/components/shared'
import { useTranslation } from 'react-i18next'

const Home = () => {
    const { t } = useTranslation()
    return (
        <Container className="h-full">
            <div className="h-full flex flex-col items-center justify-center">
                <DoubleSidedImage
                    src="/learning-cms/img/others/welcome.png"
                    darkModeSrc="/learning-cms/img/others/welcome-dark.png"
                    alt="welcome"
                />
                <div className="mt-6 text-center">
                    <h3 className="text-base">{t('home.welcome')}</h3>
                </div>
            </div>
        </Container>
    )
}

export default Home
