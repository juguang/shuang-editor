// DeepSeek API 调用层
// 用户自带API Key

const SYSTEM_PROMPT = `你是markdown格式化助手。把用户的纯文本整理为结构化的markdown。

规则：
- 段落加合适的标题（##）
- 关键信息加粗（**文本**）
- 列表自动编号（1. 2. 3. 或 - ）
- 不要改变原意，不要添加用户没说的内容
- 如果明显是会议记录/日记/读书笔记，加对应格式
- 输出纯markdown，不要加代码块标记
- 保持中文自然，不要翻译`

const LINK_SYSTEM_PROMPT = `你是链接助手。给定一段新文本和已有笔记标题列表，
找出新文本中哪些词/概念跟已有笔记标题匹配。

规则：
- 只匹配语义真正相关的，不匹配泛泛的词
- 返回JSON格式: {"links": [{"text": "匹配的文本", "title": "已有笔记标题"}]}
- 如果没有匹配，返回 {"links": []}`

export interface LlmConfig {
  provider: "deepseek" | "openai" | "ollama";
  apiKey: string;
  model: string;
  baseUrl: string;
}

export const defaultLlmConfig: LlmConfig = {
  provider: "deepseek",
  apiKey: "",
  model: "deepseek-chat",
  baseUrl: "https://api.deepseek.com/v1",
};

export function loadLlmConfig(): LlmConfig {
  const stored = localStorage.getItem("llm_config");
  if (stored) {
    try {
      return { ...defaultLlmConfig, ...JSON.parse(stored) };
    } catch {
      return defaultLlmConfig;
    }
  }
  return defaultLlmConfig;
}

export function saveLlmConfig(config: LlmConfig) {
  localStorage.setItem("llm_config", JSON.stringify(config));
}

/// 格式化纯文本为结构化markdown（流式）
export async function* formatTextStream(
  text: string,
  config: LlmConfig
): AsyncGenerator<string> {
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: text },
      ],
      stream: true,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    throw new Error(`API错误: ${response.status} ${response.statusText}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data: ")) continue;
      const data = trimmed.slice(6);
      if (data === "[DONE]") return;

      try {
        const json = JSON.parse(data);
        const delta = json.choices?.[0]?.delta?.content;
        if (delta) yield delta;
      } catch {
        // 跳过无效JSON
      }
    }
  }
}

/// 自动链接：找出文本中可以链接到已有笔记的部分
export async function autoLink(
  content: string,
  existingTitles: [string, string][],
  config: LlmConfig
): Promise<{ text: string; title: string }[]> {
  if (!config.apiKey || existingTitles.length === 0) return [];

  const titlesList = existingTitles.map(([t]) => t).join("\n");

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: "system", content: LINK_SYSTEM_PROMPT },
        {
          role: "user",
          content: `新文本:\n${content}\n\n已有笔记标题:\n${titlesList}`,
        },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) return [];

  try {
    const json = await response.json();
    const result = JSON.parse(json.choices[0].message.content);
    return result.links || [];
  } catch {
    return [];
  }
}

/// 生成标题
export async function generateTitle(
  content: string,
  config: LlmConfig
): Promise<string | null> {
  if (!config.apiKey) return null;

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        {
          role: "system",
          content: "给这段内容生成一个简短标题（10个字以内），只输出标题文字，不要加引号或其他符号。",
        },
        { role: "user", content: content.slice(0, 500) },
      ],
      temperature: 0.3,
      max_tokens: 30,
    }),
  });

  if (!response.ok) return null;

  try {
    const json = await response.json();
    return json.choices[0].message.content.trim();
  } catch {
    return null;
  }
}
