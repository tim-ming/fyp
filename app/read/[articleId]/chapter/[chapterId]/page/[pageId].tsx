import React, { useEffect, useState } from "react";
import { View, Pressable, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams, Href } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomText from "@/components/CustomText";
import ArrowLeft from "@/assets/icons/arrow-left.svg";
import ArrowRight from "@/assets/icons/arrow-right.svg";

type Page = {
  content: string;
};

type Chapter = {
  title: string;
  subtitle: string;
  totalPages: number;
  pages: { [key: string]: Page };
};

type Article = {
  chapters: { [key: string]: Chapter };
};

type Articles = {
  [key: string]: Article;
};

const ReadingPage = () => {
  const router = useRouter();
  const { articleId, chapterId, pageId } = useLocalSearchParams();
  const [chapterTitle, setChapterTitle] = useState<string>("");
  const [chapterSubtitle, setChapterSubtitle] = useState<string>("");
  const [pageContent, setPageContent] = useState<string>("");
  const [totalPages, setTotalPages] = useState<number>(1);

  const dummyArticles: Articles = {
    "1": {
      chapters: {
        "1": {
          title: "Understanding Unhelpful Thoughts",
          subtitle: "How do negative thoughts affect you?",
          totalPages: 5,
          pages: {
            "1": {
              content:
                "Many people experience negative thoughts, which can lead to a cycle of negative feelings and behaviors. Many people experience negative thoughts, which can lead to a cycle of negative feelings and behaviors. Many people experience negative thoughts, which can lead to a cycle of negative feelings and behaviors. \n\n Many people experience negative thoughts, which can lead to a cycle of negative feelings and behaviors. Many people experience negative thoughts, which can lead to a cycle of negative feelings and behaviors. Many people experience negative thoughts, which can lead to a cycle of negative feelings and behaviors. Many people experience negative thoughts, which can lead to a cycle of negative feelings and behaviors.\n\n Many people experience negative thoughts, which can lead to a cycle of negative feelings and behaviors. Many people experience negative thoughts, \n\n which can lead to a cycle of negative feelings and behaviors Many people experience negative thoughts, which can lead to a cycle of negative feelings and behaviors.\n\n Many people experience negative thoughts, which can lead to a cycle of negative feelings and behaviors. Many people experience negative thoughts, which can lead to a cycle of negative feelings and behaviors....",
            },
            "2": {
              content:
                "Some common cognitive distortions include: 1. All-or-Nothing Thinking: Viewing situations in black-and-white terms...",
            },
            "3": {
              content:
                "Recognizing these distortions in your thinking is key to overcoming them. By challenging and reframing these thoughts...",
            },
            "4": {
              content:
                "In the next chapter, we will explore how to challenge and change these unhelpful thoughts...",
            },
            "5": {
              content:
                "Remember, changing the way you think is not easy and it takes time and practice. However, with persistence...",
            },
          },
        },
        "2": {
          title: "Challenging Negative Thoughts",
          subtitle: "Techniques to change your thinking",
          totalPages: 3,
          pages: {
            "1": {
              content:
                "Now that you are familiar with cognitive distortions, the next step is to challenge them...",
            },
            "2": {
              content:
                "One way to do this is by examining the evidence for and against a particular thought...",
            },
            "3": {
              content:
                "Another technique is to consider alternative explanations. Rather than assuming the worst...",
            },
          },
        },
        "3": {
          title: "Building Positive Thought Habits",
          subtitle: "Developing healthier thinking patterns",
          totalPages: 2,
          pages: {
            "1": {
              content:
                "Developing positive thinking habits can help you maintain a more balanced perspective...",
            },
            "2": {
              content:
                "Start by identifying and reinforcing positive thoughts, and practice gratitude daily...",
            },
          },
        },
      },
    },
    "2": {
      chapters: {
        "1": {
          title: "Recognizing Anxiety Symptoms",
          subtitle: "Understanding how anxiety manifests",
          totalPages: 3,
          pages: {
            "1": {
              content:
                "Anxiety can manifest in many ways, both physically and emotionally...",
            },
            "2": {
              content:
                "Physical symptoms may include rapid heartbeat, sweating, and dizziness...",
            },
            "3": {
              content:
                "Emotionally, anxiety can cause feelings of worry, dread, and nervousness...",
            },
          },
        },
        "2": {
          title: "Managing Anxiety Triggers",
          subtitle: "Identifying and reducing triggers",
          totalPages: 2,
          pages: {
            "1": {
              content:
                "Identify and manage triggers that cause your anxiety to spike...",
            },
            "2": {
              content:
                "Common triggers include stressful events, certain environments, and specific thoughts...",
            },
          },
        },
        "3": {
          title: "Relaxation Techniques for Anxiety",
          subtitle: "Practices to calm your mind",
          totalPages: 4,
          pages: {
            "1": {
              content:
                "Practice deep breathing, progressive muscle relaxation, and mindfulness...",
            },
            "2": {
              content:
                "These techniques can help you calm your mind and body when you feel anxious...",
            },
            "3": {
              content:
                "Regular practice of relaxation techniques can reduce the overall level of anxiety...",
            },
          },
        },
      },
    },
    "3": {
      chapters: {
        "1": {
          title: "Introduction to CBT",
          subtitle: "How does CBT work?",
          totalPages: 2,
          pages: {
            "1": {
              content:
                "Cognitive Behavioral Therapy is a well-researched method for treating anxiety and depression...",
            },
            "2": {
              content:
                "CBT focuses on changing unhelpful thinking patterns and behaviors...",
            },
          },
        },
        "2": {
          title: "CBT Techniques for Anxiety",
          subtitle: "Strategies to manage anxiety with CBT",
          totalPages: 2,
          pages: {
            "1": {
              content:
                "These include exposure therapy, cognitive restructuring, and relaxation training...",
            },
            "2": {
              content:
                "Exposure therapy involves gradually facing your fears in a controlled environment...",
            },
          },
        },
        "3": {
          title: "CBT Techniques for Depression",
          subtitle: "Applying CBT to reduce depression",
          totalPages: 3,
          pages: {
            "1": {
              content:
                "Cognitive restructuring is key to treating depression...",
            },
            "2": {
              content:
                "By changing negative thinking patterns, you can alleviate depressive symptoms...",
            },
            "3": {
              content:
                "Behavioral activation is another important CBT technique for depression...",
            },
          },
        },
      },
    },
    "4": {
      chapters: {
        "1": {
          title: "Identifying Depression Symptoms",
          subtitle: "Recognizing the signs of depression",
          totalPages: 2,
          pages: {
            "1": {
              content:
                "Depression can affect your mood, thoughts, and behavior...",
            },
            "2": {
              content:
                "Symptoms may include feelings of sadness, hopelessness, and loss of interest...",
            },
          },
        },
        "2": {
          title: "Coping Strategies for Depression",
          subtitle: "Techniques to manage depressive symptoms",
          totalPages: 3,
          pages: {
            "1": {
              content:
                "Engage in regular physical activity and maintain social connections...",
            },
            "2": {
              content:
                "Therapy and medication can also be effective in treating depression...",
            },
            "3": {
              content:
                "Developing a routine and setting small, achievable goals can help you manage depression...",
            },
          },
        },
        "3": {
          title: "Seeking Help for Depression",
          subtitle: "When and how to seek professional support",
          totalPages: 3,
          pages: {
            "1": {
              content:
                "When to seek professional help and what to expect from treatment...",
            },
            "2": {
              content:
                "Talking to a therapist or counselor can provide support and guidance...",
            },
            "3": {
              content:
                "Medication can be an effective part of treatment for some people...",
            },
          },
        },
      },
    },
    "5": {
      chapters: {
        "1": {
          title: "Introduction to Mindfulness",
          subtitle: "The basics of mindfulness practices",
          totalPages: 3,
          pages: {
            "1": {
              content:
                "Mindfulness involves paying attention to the present moment...",
            },
            "2": {
              content:
                "It helps you become aware of your thoughts and feelings without judgment...",
            },
            "3": {
              content:
                "Mindfulness practices can reduce stress and improve well-being...",
            },
          },
        },
        "2": {
          title: "Mindfulness for Anxiety",
          subtitle: "Using mindfulness to manage anxiety",
          totalPages: 2,
          pages: {
            "1": {
              content:
                "Techniques include mindful breathing and body scan meditation...",
            },
            "2": {
              content:
                "These practices can help you stay grounded and calm in the face of anxiety...",
            },
          },
        },
        "3": {
          title: "Mindfulness for Depression",
          subtitle: "Mindfulness techniques for depression",
          totalPages: 3,
          pages: {
            "1": {
              content: "Mindfulness can help you manage depressive symptoms...",
            },
            "2": {
              content:
                "By staying present, you can break the cycle of rumination and negative thinking...",
            },
            "3": {
              content:
                "Regular mindfulness practice can lead to long-term improvements in mood...",
            },
          },
        },
      },
    },
  };

  useEffect(() => {
    async function fetchPageContent() {
      const chapterData =
        dummyArticles[articleId as keyof typeof dummyArticles]?.chapters[
          chapterId as keyof (typeof dummyArticles)["1"]["chapters"]
        ];

      if (chapterData) {
        const pageData =
          chapterData.pages[pageId as keyof typeof chapterData.pages];

        if (pageData) {
          setChapterTitle(chapterData.title);
          setChapterSubtitle(chapterData.subtitle);
          setPageContent(pageData.content);
          setTotalPages(chapterData.totalPages);
        }
      }
    }
    fetchPageContent();
  }, [articleId, chapterId, pageId]);

  return (
    <SafeAreaView className="flex-1 bg-blue100">
      <View className="mt-[68px]">
        <CustomText className="text-center font-medium text-lg text-gray300">
          {chapterTitle}
        </CustomText>
        <View className="h-[1px] bg-[#E7E2DE] mt-[13px]" />
      </View>

      <ScrollView className="px-4">
        <CustomText
          letterSpacing="tighter"
          className="text-[28px] leading-8 text-black200 font-medium mt-[26px] mb-6"
        >
          {chapterSubtitle}
        </CustomText>
        <CustomText className="text-base text-black100 leading-6 mb-4">
          {pageContent}
        </CustomText>
      </ScrollView>

      <View className="flex-row justify-between items-center bg-white p-6">
        <Pressable
          className={`justify-center items-center h-[50px] w-[50px] ${
            parseInt(pageId as string) === 1
              ? "bg-gray-200"
              : "bg-white border-2 border-blue200"
          } rounded-full`}
          disabled={parseInt(pageId as string) === 1}
          onPress={() =>
            router.push(
              `/read/${articleId}/chapter/${chapterId}/page/${
                parseInt(pageId as string) - 1
              }` as Href<string>
            )
          }
        >
          <ArrowLeft
            width={32}
            height={32}
            stroke={
              parseInt(pageId as string) === 1
                ? "rgba(0, 0, 0, 0.3)"
                : "#3373B0"
            }
          />
        </Pressable>

        <View className="flex-1 justify-center items-center gap-2">
          <CustomText className="text-base font-medium text-black200">
            {pageId} / {totalPages}
          </CustomText>
          <CustomText className="max-w-[200px] font-medium text-sm leading-4  text-gray300 text-center">
            {chapterSubtitle}
          </CustomText>
        </View>

        <Pressable
          className={`justify-center items-center h-[50px] w-[50px] ${
            parseInt(pageId as string) === totalPages
              ? "bg-gray-200"
              : "bg-blue200"
          } rounded-full`}
          disabled={parseInt(pageId as string) === totalPages}
          onPress={() =>
            router.push(
              `/read/${articleId}/chapter/${chapterId}/page/${
                parseInt(pageId as string) + 1
              }` as Href<string>
            )
          }
        >
          <ArrowRight
            width={32}
            height={32}
            stroke={
              parseInt(pageId as string) === totalPages
                ? "rgba(0, 0, 0, 0.3)"
                : "#FFFFFF"
            }
          />
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default ReadingPage;
