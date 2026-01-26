'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getInstructorQuizzes, updateQuiz, UpdateQuizRequest } from '@/services/quizzService';
import { useRouter } from 'next/navigation';
import { Form, Input, Button, Spin, Alert, Card, Space, Divider, Tag, Checkbox } from 'antd';
import { DeleteOutlined, SaveOutlined, ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';

interface QuizUpdateFormProps {
  quizId: number;
  locale?: string;
}

const QuizUpdateForm: React.FC<QuizUpdateFormProps> = ({ quizId, locale = 'en' }) => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('CreateUpdateQuiz');
  const [formData, setFormData] = useState<UpdateQuizRequest>({
    id: quizId,
    title: '',
    description: '',
    questions: [],
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const quizData = await getInstructorQuizzes(quizId);
        const quiz = Array.isArray(quizData) ? quizData[0] : quizData;
        if (!quiz) throw new Error('Quiz not found');
        console.log('Quiz data: ', quiz);
        setFormData({
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          questions: quiz.questions.map(q => ({
            id: q.id,
            question_text: q.question_text,
            options: q.options.map(o => ({
              id: o.id,
              option_text: o.option_text,
              order: o.sort_order,
              is_correct: Boolean(o.is_correct),
              is_deleted: false,
            })),
            is_deleted: false,
          })),
        });
        form.setFieldsValue({
          title: quiz.title,
          description: quiz.description,
        });
      } catch (err: any) {
        console.error('Failed to load quiz:', err);
        setError(err.message || 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [quizId, form]);

  const getValidationError = () => {
    for (const q of formData.questions) {
      if (q.is_deleted) continue;
      const activeOptions = q.options.filter(o => !o.is_deleted);
      if (activeOptions.length !== 4) {
        return `Question "${q.question_text || '(Empty)'}" must have exactly 4 options`;
      }
    }
    return null;
  };

  const prepareSubmitData = () => {
    return {
      ...formData,
      title: formData.title,
      description: formData.description,
      questions: formData.questions.map(q => ({
        id: q.id === 0 ? undefined : q.id,
        question_text: q.question_text,
        options: q.options.map(o => ({
          id: o.id === 0 ? undefined : o.id,
          option_text: o.option_text,
          order: o.order,
          is_correct: Boolean(o.is_correct),
          is_deleted: o.is_deleted,
        })),
        is_deleted: q.is_deleted,
      })),
    };
  };

  const handleSubmit = async (values: any) => {
    console.log('🎯 Form submitted with values:', values);
    console.log('🎯 Current formData:', formData);
    const validationError = getValidationError();
    if (validationError) {
      console.error('❌ Validation error:', validationError);
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      const submitData = prepareSubmitData();
      console.log('📤 Submitting data:', submitData);
      const result = await updateQuiz(submitData);
      console.log('✅ Quiz updated successfully:', result);
      router.push(`/${locale}/instructor-my-quiz-attempts`);
    } catch (err: any) {
      console.error('❌ Error updating quiz:', err);
      setError(err.message || 'Failed to update quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const addQuestion = () => {
    const newQuestion = {
      id: 0,
      question_text: '',
      options: [
        { id: 0, option_text: '', order: 1, is_correct: false, is_deleted: false },
        { id: 0, option_text: '', order: 2, is_correct: false, is_deleted: false },
        { id: 0, option_text: '', order: 3, is_correct: false, is_deleted: false },
        { id: 0, option_text: '', order: 4, is_correct: false, is_deleted: false },
      ],
      is_deleted: false,
    };
    setFormData({
      ...formData,
      questions: [...formData.questions, newQuestion],
    });
  };

  const addOption = (qIndex: number) => {
    const updated = [...formData.questions];
    const activeOptions = updated[qIndex].options.filter(o => !o.is_deleted);

    if (activeOptions.length < 4) {
      updated[qIndex].options.push({
        id: 0,
        option_text: '',
        order: (updated[qIndex].options.length || 0) + 1,
        is_correct: false,
        is_deleted: false,
      });
      setFormData({ ...formData, questions: updated });
    }
  };

  const canAddOption = (qIndex: number) => {
    const activeOptions = formData.questions[qIndex].options.filter(o => !o.is_deleted);
    return activeOptions.length < 4 && !formData.questions[qIndex].is_deleted;
  };

  if (loading) {
    return (
      <div className="col-xl-9 col-lg-9 col-md-8">
        <Card loading>
          <Spin tip="Loading quiz data..." />
        </Card>
      </div>
    );
  }

  if (error && formData.questions.length === 0) {
    return (
      <div className="col-xl-9 col-lg-9 col-md-8">
        <Card>
          <Alert type="error" message="Error" description={error} showIcon />
          <Button
            type="default"
            icon={<ArrowLeftOutlined />}
            onClick={() => router.back()}
            className="mt-3"
          >
            {t('goBack')}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: '900px' }}>
        <Card title={t('updateTitle')} className="shadow-sm">
          {error && (
            <Alert
              type="error"
              message={error}
              showIcon
              closable
              onClose={() => setError(null)}
              className="mb-4"
            />
          )}

          <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off">
            <div
              style={{
                marginBottom: '24px',
                paddingBottom: '16px',
                borderBottom: '1px solid #f0f0f0',
              }}
            >
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  icon={<SaveOutlined />}
                  size="large"
                >
                  {t('updateQuiz')}
                </Button>
                <Button
                  type="default"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => router.back()}
                  size="large"
                >
                  {t('cancel')}
                </Button>
              </Space>
            </div>

            <Form.Item
              label={t('quizTitle')}
              name="title"
              rules={[{ required: true, message: t('pleaseInputQuizTitle') }]}
              initialValue={formData.title}
            >
              <Input
                placeholder={t('enterQuizTitle')}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </Form.Item>

            <Form.Item
              label={t('quizDescription')}
              name="description"
              rules={[{ required: true, message: t('pleaseInputQuizDescription') }]}
              initialValue={formData.description}
            >
              <Input.TextArea
                rows={4}
                placeholder={t('enterQuizDescription')}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </Form.Item>

            <Divider orientation="left">
              {t('questions')} ({formData.questions.length})
            </Divider>

            {formData.questions.length === 0 ? (
              <Alert type="info" message={t('noQuestionsAdded')} className="mb-3" />
            ) : (
              formData.questions.map((question, qIndex) => (
                <Card
                  key={qIndex}
                  className="mb-4"
                  type="inner"
                  style={{ opacity: question.is_deleted ? 0.6 : 1 }}
                  extra={
                    <Button
                      type={question.is_deleted ? 'default' : 'text'}
                      danger={!question.is_deleted}
                      size="small"
                      onClick={() => {
                        const updated = [...formData.questions];
                        updated[qIndex].is_deleted = !updated[qIndex].is_deleted;
                        setFormData({ ...formData, questions: updated });
                      }}
                    >
                      {question.is_deleted ? t('restore') : <DeleteOutlined />}
                    </Button>
                  }
                >
                  <Form.Item label={`${t('question')} ${qIndex + 1}`}>
                    <Input.TextArea
                      rows={2}
                      value={question.question_text}
                      onChange={e => {
                        const updated = [...formData.questions];
                        updated[qIndex].question_text = e.target.value;
                        setFormData({ ...formData, questions: updated });
                      }}
                      placeholder={t('enterQuestionText')}
                      disabled={question.is_deleted}
                    />
                  </Form.Item>

                  <Form.Item label={t('options')}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} style={{ opacity: option.is_deleted ? 0.5 : 1 }}>
                          <Space direction="vertical" style={{ width: '100%' }}>
                            <Space.Compact style={{ width: '100%' }}>
                              <Input
                                placeholder={`${t('option')} ${oIndex + 1}`}
                                value={option.option_text}
                                onChange={e => {
                                  const updated = [...formData.questions];
                                  updated[qIndex].options[oIndex].option_text = e.target.value;
                                  setFormData({ ...formData, questions: updated });
                                }}
                                disabled={option.is_deleted}
                              />
                              <Button
                                type={option.is_deleted ? 'default' : 'text'}
                                danger={!option.is_deleted}
                                icon={<DeleteOutlined />}
                                onClick={() => {
                                  const updated = [...formData.questions];
                                  updated[qIndex].options[oIndex].is_deleted =
                                    !updated[qIndex].options[oIndex].is_deleted;
                                  setFormData({ ...formData, questions: updated });
                                }}
                              />
                            </Space.Compact>
                            <Checkbox
                              checked={option.is_correct}
                              onChange={e => {
                                const updated = [...formData.questions];
                                updated[qIndex].options[oIndex].is_correct = e.target.checked;
                                setFormData({ ...formData, questions: updated });
                              }}
                              disabled={option.is_deleted}
                              style={{ marginLeft: '8px' }}
                            >
                              <span style={{ fontSize: '12px' }}>{t('correctAnswer')}</span>
                            </Checkbox>
                          </Space>
                        </div>
                      ))}
                    </Space>
                    <Button
                      type="dashed"
                      block
                      icon={<PlusOutlined />}
                      onClick={() => addOption(qIndex)}
                      className="mt-2"
                      disabled={!canAddOption(qIndex)}
                    >
                      {t('addOption')}
                    </Button>
                  </Form.Item>
                </Card>
              ))
            )}

            <Button
              type="dashed"
              block
              icon={<PlusOutlined />}
              onClick={addQuestion}
              size="large"
              className="mb-4"
            >
              {t('addQuestion')}
            </Button>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default QuizUpdateForm;
