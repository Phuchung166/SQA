package com.ptit.onlinelearning.service.quiz;


import com.ptit.onlinelearning.exception.DataNotFoundException;
import com.ptit.onlinelearning.model.CourseModule;
import com.ptit.onlinelearning.model.Option;
import com.ptit.onlinelearning.model.Question;
import com.ptit.onlinelearning.model.Quiz;
import com.ptit.onlinelearning.repository.CourseModuleRepository;
import com.ptit.onlinelearning.repository.OptionRepository;
import com.ptit.onlinelearning.repository.QuestionRepository;
import com.ptit.onlinelearning.repository.QuizRepository;
import com.ptit.onlinelearning.request.UpdateQuizRequest;
import com.ptit.onlinelearning.response.MessageResponse;
import com.ptit.onlinelearning.response.PageableResponse;
import com.ptit.onlinelearning.response.quiz.OptionResponse;
import com.ptit.onlinelearning.response.quiz.QuestionResponse;
import com.ptit.onlinelearning.response.quiz.QuizDetailResponse;
import com.ptit.onlinelearning.response.quiz.QuizStatisticResponse;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.InputStream;
import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class QuizService implements  IQuizService {
    private final QuizRepository quizRepository;
    private final CourseModuleRepository courseModuleRepository;
    private final QuestionRepository questionRepository;
    private final OptionRepository optionRepository;
    private final EntityManager entityManager;


    @Override
    @Transactional
    public MessageResponse importQuestions(String description, String title, Long moduleId,
                                           MultipartFile file, Boolean isMandatory) {

        try {
            Optional<CourseModule> courseModule = courseModuleRepository.findById(moduleId);
            if(courseModule.isEmpty()){
                throw new DataNotFoundException("Course module not found with id: " + moduleId);
            }
            Quiz  quiz = Quiz.builder()
                    .title(title)
                    .description(description)
                    .isActive(true)
                    .courseModule(courseModule.get())
                    .build();
            quizRepository.saveAndFlush(quiz);
            InputStream inputStream = file.getInputStream();
            Workbook workbook = WorkbookFactory.create(inputStream);
            Sheet sheet = workbook.getSheetAt(0);
            Row headerRow = sheet.getRow(0);
            Map<String, Integer> headerMap = readHeader(headerRow);
            List<Question> questionList = new ArrayList<>();
            for (int i =1; i<= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if(row == null || isRowEmpty(row)) continue;
                questionList.add(praseQuestionFromRow(row, headerMap, quiz));
            }

            questionRepository.saveAll(questionList);
            return new MessageResponse("Questions imported successfully");

        }catch (Exception e){
            log.error("Error importing questions: {}", e.getMessage());
            throw new RuntimeException("Failed to import questions: " + e.getMessage());
        }
    }

    @Override
    public QuizDetailResponse getQuizById(Long id) {

        Optional<Quiz> quiz = quizRepository.findByIdWithQuestionsAndOptions(id);
        if(quiz.isEmpty()){
            throw new DataNotFoundException("Quiz not found with id: " + id);
        }
        List<QuestionResponse> questionResponses = quiz.get().getQuestions().stream().map(
                question -> new QuestionResponse(
                        question.getId(),
                        question.getQuestionText(),
                        question.getOptions().stream()
                                .sorted(Comparator.comparing(Option::getSortOrder))
                                .map(
                                option -> com.ptit.onlinelearning.response.quiz.OptionResponse.builder()
                                        .id(option.getId())
                                        .optionText(option.getOptionText())
                                        .sortOrder(option.getSortOrder())
                                        // Không trả về isCorrect cho student
                                        .build()
                        ).toList()
                )
        ).toList();
        return QuizDetailResponse.builder()
                .questions(questionResponses)
                .id(quiz.get().getId())
                .description(quiz.get().getDescription())
                .title(quiz.get().getTitle())
                .isMandatory(quiz.get().getIsMandatory())
                .build();
    }

    @Override
    public QuizDetailResponse getQuizByIdForInstructor(Long id) {

        Optional<Quiz> quiz = quizRepository.findByIdWithQuestionsAndOptions(id);
        if(quiz.isEmpty()){
            throw new DataNotFoundException("Quiz not found with id: " + id);
        }
        List<QuestionResponse> questionResponses = quiz.get().getQuestions().stream().map(
                question -> new QuestionResponse(
                        question.getId(),
                        question.getQuestionText(),
                        question.getOptions().stream()
                                .sorted(Comparator.comparing(Option::getSortOrder))
                                .map(
                                option -> com.ptit.onlinelearning.response.quiz.OptionResponse.builder()
                                        .id(option.getId())
                                        .optionText(option.getOptionText())
                                        .sortOrder(option.getSortOrder())
                                        .isCorrect(option.getIsCorrect()) // Trả về isCorrect cho instructor
                                        .build()
                        ).toList()
                )
        ).toList();
        return QuizDetailResponse.builder()
                .questions(questionResponses)
                .id(quiz.get().getId())
                .description(quiz.get().getDescription())
                .title(quiz.get().getTitle())
                .isMandatory(quiz.get().getIsMandatory())
                .build();
    }

    @Override
    public PageableResponse<QuizStatisticResponse> getQuizStatisticsByModuleId(int page, int pageSize, Long courseId) {
        int zeroBasedPage = Math.max(0, page - 1);
        Pageable pageable = PageRequest.of(zeroBasedPage, pageSize);
        Page<QuizStatisticResponse> result = quizRepository.statisticsQuizByModuleId(pageable, courseId);
        List<QuizStatisticResponse> data = result.getContent();
        return PageableResponse.<QuizStatisticResponse>builder()
                .currentPage(result.getNumber() + 1)
                .totalPages(result.getTotalPages())
                .totalElements(result.getTotalElements())
                .pageSize(result.getSize())
                .hasNext(result.hasNext())
                .hasPrevious(result.hasPrevious())
                .data(data)
                .build();
    }

    @Override
    @Transactional
    public String toggleQuizStatus(Long id) {
        Optional<Quiz> quiz = quizRepository.findQuizById(id);
        if(quiz.isEmpty()){
            throw new DataNotFoundException("Quiz not found with id: " + id);
        }
        Quiz quizEntity = quiz.get();
        boolean currentStatus = quizEntity.getIsActive();
        quizEntity.setIsActive(!currentStatus);
        
        String statusMessage = !currentStatus ? "activated" : "deactivated";
        return "Quiz " + statusMessage + " successfully";
    }

    @Transactional
    public QuizDetailResponse updateQuiz(UpdateQuizRequest req) {

        Quiz quiz = quizRepository.findByIdWithQuestionsAndOptions(req.getId())
                .orElseThrow(() ->
                        new DataNotFoundException("Quiz not found with id: " + req.getId()));

        if (req.getTitle() != null) {
            quiz.setTitle(req.getTitle());
        }
        if (req.getDescription() != null) {
            quiz.setDescription(req.getDescription());
        }

        if (req.getQuestions() == null) {
            return toQuizDetailResponse(quiz);
        }

        for (var qReq : req.getQuestions()) {

            if (Boolean.TRUE.equals(qReq.getIsDeleted()) && qReq.getId() != null) {
                Question question = quiz.getQuestions().stream()
                        .filter(q -> q.getId().equals(qReq.getId()))
                        .findFirst()
                        .orElseThrow(() ->
                                new DataNotFoundException("Question not found: " + qReq.getId()));
                quiz.getQuestions().remove(question);
                continue;
            }

            if (qReq.getId() == null) {
                Question newQuestion = new Question();
                newQuestion.setQuestionText(qReq.getQuestionText());
                newQuestion.setQuiz(quiz);
                newQuestion.setOptions(new HashSet<>());

                questionRepository.saveAndFlush(newQuestion);

                if (qReq.getOptions() != null) {
                    for (var oReq : qReq.getOptions()) {
                        Option opt = new Option();
                        opt.setOptionText(oReq.getOptionText());
                        opt.setSortOrder(oReq.getOrder());
                        opt.setIsCorrect(Boolean.TRUE.equals(oReq.getIsCorrect()));
                        opt.setQuestion(newQuestion);
                        
                        optionRepository.saveAndFlush(opt);
                        newQuestion.getOptions().add(opt);
                    }
                }

                quiz.getQuestions().add(newQuestion);
                continue;
            }

            // ===== UPDATE QUESTION =====
            Question question = quiz.getQuestions().stream()
                    .filter(q -> q.getId().equals(qReq.getId()))
                    .findFirst()
                    .orElseThrow(() ->
                            new DataNotFoundException("Question not found: " + qReq.getId()));

            if (qReq.getQuestionText() != null) {
                question.setQuestionText(qReq.getQuestionText());
            }

            if (qReq.getOptions() == null) continue;

            for (var oReq : qReq.getOptions()) {

                if (Boolean.TRUE.equals(oReq.getIsDeleted()) && oReq.getId() != null) {
                    Option option = question.getOptions().stream()
                            .filter(o -> o.getId().equals(oReq.getId()))
                            .findFirst()
                            .orElseThrow(() ->
                                    new DataNotFoundException("Option not found: " + oReq.getId()));
                    question.getOptions().remove(option);
                    continue;
                }

                if (oReq.getId() == null) {
                    Option opt = new Option();
                    opt.setOptionText(oReq.getOptionText());
                    opt.setSortOrder(oReq.getOrder());
                    opt.setIsCorrect(Boolean.TRUE.equals(oReq.getIsCorrect()));
                    opt.setQuestion(question);
                    optionRepository.saveAndFlush(opt);
                    question.getOptions().add(opt);
                    continue;
                }

                // UPDATE OPTION
                Option option = question.getOptions().stream()
                        .filter(o -> o.getId().equals(oReq.getId()))
                        .findFirst()
                        .orElseThrow(() ->
                                new DataNotFoundException("Option not found: " + oReq.getId()));

                if (oReq.getOptionText() != null) {
                    option.setOptionText(oReq.getOptionText());
                }
                if (oReq.getOrder() != null) {
                    option.setSortOrder(oReq.getOrder());
                }
                if (oReq.getIsCorrect() != null) {
                    option.setIsCorrect(oReq.getIsCorrect());
                }
            }
        }

        return toQuizDetailResponse(quiz);
    }

    private QuizDetailResponse toQuizDetailResponse(Quiz quiz) {

        List<QuestionResponse> questions = quiz.getQuestions().stream()
                .map(q -> new QuestionResponse(
                        q.getId(),
                        q.getQuestionText(),
                        q.getOptions().stream()
                                .sorted(Comparator.comparing(Option::getSortOrder))
                                .map(o -> OptionResponse.builder()
                                        .id(o.getId())
                                        .optionText(o.getOptionText())
                                        .sortOrder(o.getSortOrder())
                                        .build())
                                .toList()
                ))
                .toList();

        return QuizDetailResponse.builder()
                .id(quiz.getId())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .isMandatory(quiz.getIsMandatory())
                .questions(questions)
                .build();
    }




    private Map<String, Integer> readHeader(Row headerRow){
        Map<String, Integer> headerMap = new HashMap<>();
        for(Cell cell: headerRow){
            String headerName = cell.getStringCellValue().trim();
            if(!headerName.isEmpty()){
                headerMap.put(headerName, cell.getColumnIndex());
            }
        }
        return headerMap;
    }

    private String getCellStringValue(Cell cell) {
        if (cell == null) {
            return "";
        }
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> BigDecimal.valueOf(cell.getNumericCellValue()).stripTrailingZeros().toPlainString();
            default -> "";
        };
    }
    private String getValueByColumnName(Row row, Map<String, Integer> headerMap, String columnName) {
        Integer colIndex = headerMap.get(columnName);
        if (colIndex == null) {
            return "";
        }
        Cell cell = row.getCell(colIndex);
        return getCellStringValue(cell);
    }

    private Question praseQuestionFromRow(Row row, Map<String, Integer> headerMap, Quiz quiz) {
        String questionText = getValueByColumnName(row, headerMap, "Question Text");
        String option1Text = getValueByColumnName(row, headerMap, "Option 1");
        String option2Text = getValueByColumnName(row, headerMap, "Option 2");
        String option3Text = getValueByColumnName(row, headerMap, "Option 3");
        String option4Text = getValueByColumnName(row, headerMap, "Option 4");
        String correctOption = getValueByColumnName(row, headerMap, "Correct Answer");

        Question question = Question.builder()
                .quiz(quiz)
                .questionText(questionText)
                .build();
        Set<Option> options = new HashSet<>();
        options.add(Option.builder().question(question).optionText(option1Text).sortOrder(1L).isCorrect("1".equalsIgnoreCase(correctOption)).build());
        options.add(Option.builder().question(question).optionText(option2Text).sortOrder(2L).isCorrect("2".equalsIgnoreCase(correctOption)).build());
        options.add(Option.builder().question(question).optionText(option3Text).sortOrder(3L).isCorrect("3".equalsIgnoreCase(correctOption)).build());
        options.add(Option.builder().question(question).optionText(option4Text).sortOrder(4L).isCorrect("4".equalsIgnoreCase(correctOption)).build());

        question.setOptions(options);
        return question;
    }
    private boolean isRowEmpty(Row row) {
        if (row == null) return true;
        for (int c = row.getFirstCellNum(); c < row.getLastCellNum(); c++) {
            Cell cell = row.getCell(c, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK);
            if (cell != null && cell.getCellType() != CellType.BLANK && !getCellStringValue(cell).isBlank()) {
                return false;
            }
        }
        return true;
    }
}
