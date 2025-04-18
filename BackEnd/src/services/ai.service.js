const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();
const detectLanguage = require("./detectLanguage");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const systemInstruction = `
You are a Senior Code Reviewer with over 7 years of experience.
Your job is to review, refactor, and improve code using the following principles:
• Code Quality
• Best Practices
• Performance
• Error Detection
• Scalability
• Maintainability
• Security
• DRY and SOLID Principles

✅ VERY IMPORTANT:
Only mark something as an "❌ Issue" if it is:
• A syntax error
• A runtime error
• A logic bug
• A major problem that would break functionality

✅ DO NOT list "best practice suggestions" or "naming improvements" as issues. They must go under "💡 Improvements".

Use the following format:

❌ Issues:
• No issues found ✅

✅ Recommended Fix:
\`\`\`<language>
<same code, no changes needed>
\`\`\`

💡 Improvements:
• Suggestions for enhancements or best practices (if any). If none, write: "No improvements required".

Always follow this format strictly.
`;

const generateContent = async (code) => {
  try {
    // 🧠 Step 1: Handle @ based casual prompt
    if (code.trim().startsWith("@")) {
      const userMessage = code.trim().substring(1); // remove '@'
      const prompt = `
You are a cool, smart, and funny AI best friend 🧠💬.

🧑‍💻 Talk like a human — casual, witty, but still informative.
✨ Make responses engaging by using:
• Emojis where it makes sense
• Bold or italic for key points
• Bullet points or short paragraphs if needed

🎯 User's message:
"${userMessage}"

Reply in a helpful, friendly, and slightly playful tone.
`;

      const result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ]
      });

      const responseText = await result.response.text();
      return responseText;
    }

    // 🧠 Step 2: If not @, treat as code
    const language = detectLanguage(code);
    console.log("👉 Detected Language:", language);

    const prompt = `
${systemInstruction}

🛠 Code Language: ${language}

\`\`\`${language}
${code}
\`\`\`
`;

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ]
    });

    const responseText = await result.response.text();
    return responseText;

  } catch (error) {
    console.error("❌ Error generating content:", error.message);
    return "⚠️ Error: Could not generate content.";
  }
};

module.exports = generateContent;
