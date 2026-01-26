import ModeSwitcher from './ModeSwitcher'
import LayoutSwitcher from './LayoutSwitcher'
import ThemeSwitcher from './ThemeSwitcher'
import NavModeSwitcher from './NavModeSwitcher'
import CopyButton from './CopyButton'
import { useTranslation } from 'react-i18next'

export type ThemeConfiguratorProps = {
    callBackClose?: () => void
}

const ThemeConfigurator = ({ callBackClose }: ThemeConfiguratorProps) => {
    const { t } = useTranslation()
    return (
        <div className="flex flex-col h-full justify-between">
            <div className="flex flex-col gap-y-10 mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h6>{t('config.themeConfigurator.darkMode')}</h6>
                        <span>{t('config.themeConfigurator.switchDarkModeText')}</span>
                    </div>
                    <ModeSwitcher />
                </div>
                <div>
                    <h6 className="mb-3">
                        {t('config.themeConfigurator.navMode')}
                    </h6>
                    <NavModeSwitcher />
                </div>
                <div>
                    <h6 className="mb-3">
                        {t('config.themeConfigurator.theme')}
                    </h6>
                    <ThemeSwitcher />
                </div>
                <div>
                    <h6 className="mb-3">
                        {t('config.themeConfigurator.layout')}
                    </h6>
                    <LayoutSwitcher />
                </div>
            </div>
            {/* <CopyButton /> */}
        </div>
    )
}

export default ThemeConfigurator
