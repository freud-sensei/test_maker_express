const { ChatOpenAI } = require("@langchain/openai");
const { PromptTemplate } = require("@langchain/core/prompts");
const { z } = require("zod");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

function readTxt(fileLoc) {
  try {
    input_data = fs.readFileSync(fileLoc, "utf8");
    return input_data;
  } catch (err) {
    console.error("Error reading the file:", err);
    throw new Error("File reading failed");
  }
}

// 퀴즈에 답을 추가하고 섞기
function makeAnswer(record) {
  const answer = Math.floor(Math.random() * 5);
  record["answer"] = answer;
  record["options"].splice(answer, 0, record["correct"]);
}

async function aiMakeQuiz(input_data, language, num_questions) {
  console.log("문제 생성 중");
  if (input_data === "test") {
    input_data = readTxt("seeds/example.txt");
  }
  const singleQuestion = z.object({
    question: z.string().describe("Multiple choice question with 5 options"),
    correct: z.string().describe("The correct option"),
    options: z
      .array(z.string())
      .min(4)
      .max(4)
      .describe("List of incorrect options"),
    explanation: z
      .string()
      .describe("Explanation on why the answer is correct for the question"),
  });

  const questionMaker = z.object({
    questions: z
      .array(singleQuestion)
      .min(num_questions)
      .max(num_questions)
      .describe("List of questions"),
  });

  const model = new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0 });

  const structuredModel = model.withStructuredOutput(questionMaker, {
    method: "json_mode",
  });

  const prompt = new PromptTemplate({
    template: `You are a study assistant which must generate unique {num_questions} multiple-choice questions for students.
    By using [INPUT_DATA], make multiple choice questions in a structured format.
    You must make one correct answer, and four incorrect answers.
    The language must be in {language}.
    Tips: You must return {num_questions} questions, not more and not less.
    [INPUT_DATA]:
    {input_data}`,
    inputVariables: ["num_questions", "language", "input_data"],
  });

  const formattedPrompt = await prompt.format({
    num_questions,
    language,
    input_data,
  });
  const responseJson = await structuredModel.invoke(formattedPrompt);

  console.log("문제 생성 완료");
  for (let record of responseJson["questions"]) {
    makeAnswer(record);
  }

  return responseJson["questions"];
}

module.exports = { readTxt, aiMakeQuiz };
