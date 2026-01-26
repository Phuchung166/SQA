import ForgotForm from '@/form/auth/forgot-form';
import Wrapper from '@/layout/DefaultWrapper';
import { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth.forgotPassword' });
  return {
    title: t('title'),
  };
}

const ForgotPasswordPage = () => {
  const t = useTranslations('auth.forgotPassword');

  return (
    // <Wrapper>
    <section className="bd-authentication-cover-main">
      <div className="row h100vh mx-0 d-flex-center">
        <div className="col-xxl-8 col-xl-7 mt-20">
          <div className="row justify-content-center align-items-center h100p">
            <div className="col-xxl-7 col-xl-9 col-lg-6 col-md-6 col-sm-8 col-12">
              <div className="bd-authentication-form-wrapper">
                <h3 className="title mb-10">{t('title')}</h3>
                <p className="mb-20">{t('subtitle')}</p>
                <ForgotForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    // </Wrapper>
  );
};

export default ForgotPasswordPage;
