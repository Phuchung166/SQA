import { useMemo, useState } from 'react'
import Avatar from '@/components/ui/Avatar'
import Dropdown from '@/components/ui/Dropdown'
import Spinner from '@/components/ui/Spinner'
import classNames from 'classnames'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import { setLang, useAppSelector, useAppDispatch } from '@/store'
import { dateLocales } from '@/locales'
import dayjs from 'dayjs'
// eslint-disable-next-line import/no-named-as-default
import i18n from 'i18next'
import { HiCheck } from 'react-icons/hi'
import type { CommonProps } from '@/@types/common'
import en from '@/locales/lang/en.json'
import vi from '@/locales/lang/vi.json'
import { useTranslation } from 'react-i18next'

const languageList = [
    { value: 'en', flag: 'us' },
    // { value: 'zh-cn', flag: 'cn' },
    // { value: 'es', flag: 'sp' },
    // { value: 'ar', flag: 'ar' },
    { value: 'vi', flag: 'vi' },
]

const _LanguageSelector = ({ className }: CommonProps) => {
    const { t, i18n } = useTranslation()
    const [loading, setLoading] = useState(false)
    const locale = useAppSelector((state) => state.locale.currentLang)
    const dispatch = useAppDispatch()

    const selectLangFlag = useMemo(() => {
        return languageList.find((lang) => lang.value === locale)?.flag
    }, [locale])

    const selectedLanguage = (
        <div className={classNames(className, 'flex items-center')}>
            {loading ? (
                <Spinner size={20} />
            ) : (
                <Avatar
                    size={24}
                    shape="circle"
                    src={`/learning-cms/img/countries/${selectLangFlag}.png`}
                />
            )}
        </div>
    )

    const onLanguageSelect = (lang: string) => {
        setLoading(true)
        i18n.changeLanguage(lang).then(() => {
            dateLocales[lang]()
                .then(() => {
                    dayjs.locale(lang)
                    dispatch(setLang(lang)) // Lưu vào Redux
                    setLoading(false)
                })
                .catch(() => {
                    dispatch(setLang(lang))
                    setLoading(false)
                })
        })
    }

    return (
        <Dropdown renderTitle={selectedLanguage} placement="bottom-end">
            {languageList.map((lang) => (
                <Dropdown.Item
                    key={lang.value}
                    className="mb-1 justify-between"
                    eventKey={lang.value}
                    onClick={() => onLanguageSelect(lang.value)}
                >
                    <span className="flex items-center">
                        <Avatar
                            size={18}
                            shape="circle"
                            src={`/learning-cms/img/countries/${lang.flag}.png`}
                        />
                        <span className="ltr:ml-2 rtl:mr-2">
                            {t(`language.${lang.value}`)}
                        </span>
                    </span>
                    {locale === lang.value && (
                        <HiCheck className="text-emerald-500 text-lg" />
                    )}
                </Dropdown.Item>
            ))}
        </Dropdown>
    )
}

const LanguageSelector = withHeaderItem(_LanguageSelector)

export default LanguageSelector
