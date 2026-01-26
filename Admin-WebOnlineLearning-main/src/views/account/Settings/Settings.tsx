import Tabs from '@/components/ui/Tabs'
import { AdaptableCard } from '@/components/shared'
import Container from '@/components/shared/Container'
import { useNavigate, useLocation } from 'react-router-dom'
import isEmpty from 'lodash/isEmpty'
import { apiGetProfileInfo } from '@/services/AccountServices'
import { lazy, Suspense, useEffect, useState } from 'react'
import { GetAccountInfo } from '@/@types/user'

const Profile = lazy(() => import('./components/Profile'))
const Password = lazy(() => import('./components/Password'))
const { TabNav, TabList } = Tabs

const settingsMenu: Record<
    string,
    {
        label: string
        path: string
    }
> = {
    profile: { label: 'Thông tin', path: 'profile' },
    password: { label: 'Mật khẩu', path: 'password' },
}

const Settings = () => {
    const [currentTab, setCurrentTab] = useState('profile')
    const [data, setData] = useState<Partial<GetAccountInfo>>({})

    const navigate = useNavigate()

    const location = useLocation()

    const path = location.pathname.substring(
        location.pathname.lastIndexOf('/') + 1
    )

    const onTabChange = (val: string) => {
        if (val === 'profile') {
            fetchData()
        }
        setCurrentTab(val)
        navigate(`/account/settings/${val}`)
    }

    const fetchData = async () => {
        const response = await apiGetProfileInfo()
        const data = response.data
        if (data.code === 0) {
            setData(data.data)
        }
    }

    useEffect(() => {
        setCurrentTab(path)
        if (isEmpty(data)) {
            fetchData()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <Container>
            <AdaptableCard>
                <Tabs value={currentTab} onChange={(val) => onTabChange(val)}>
                    <TabList>
                        {Object.keys(settingsMenu).map((key) => (
                            <TabNav key={key} value={key}>
                                {settingsMenu[key].label}
                            </TabNav>
                        ))}
                    </TabList>
                </Tabs>
                <div className="px-4 py-6">
                    <Suspense fallback={<></>}>
                        {currentTab === 'profile' && <Profile data={data} />}
                        {currentTab === 'password' && <Password />}
                    </Suspense>
                </div>
            </AdaptableCard>
        </Container>
    )
}

export default Settings
