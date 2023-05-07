import * as React from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { useTranslation } from "next-i18next";
import { useTheme } from "next-themes";
import { useDateFormat } from "l-hooks";
import {
  AiOutlineDelete,
  AiFillGithub,
  AiOutlineSetting,
} from "react-icons/ai";
import { MdOutlineLightMode, MdDarkMode } from "react-icons/md";
import { HiLightBulb } from "react-icons/hi";
import { v4 as uuidv4 } from "uuid";
import { Drawer, Confirm, Button } from "@/components";
import { useChannel, initChannelList } from "@/hooks";
import { useMobileMenuOpen, useSettingOpen } from "@/state";
import { AI_MODELS } from "@/utils/models";
import renderIcon from "../renderIcon";

const MobileMenu: React.FC = () => {
  const { t } = useTranslation("menu");
  const { theme, setTheme } = useTheme();
  const { format } = useDateFormat();
  const setOpen = useMobileMenuOpen((state) => state.update);
  const [nowTheme, setNowTheme] = React.useState<any>("");

  const [channel, setChannel] = useChannel();
  const open = useMobileMenuOpen((state) => state.open);
  const setSettingOpen = useSettingOpen((state) => state.update);

  const onClose = () => setOpen(false);

  const stopPropagation = (e: any) => e.stopPropagation();

  const onAddChannel = () => {
    const channel_id = uuidv4();
    setChannel((channel) => {
      channel.list.push({
        channel_id,
        channel_icon: "RiChatSmile2Line",
        channel_name: "",
        channel_model: {
          type: AI_MODELS[0].value,
          name: AI_MODELS[0].models[0].value,
        },
        channel_prompt: "",
        chat_list: [],
      });
      channel.activeId = channel_id;
      return channel;
    });
    onClose();
  };

  const onChangeChannel = (id: string) => {
    if (id === channel.activeId) return onClose();
    setChannel((channel) => {
      channel.activeId = id;
      return channel;
    });
    onClose();
  };

  const onDeleteChannel = (id: string) => {
    if (channel.list.length <= 1) {
      setChannel((channel) => {
        channel.list = initChannelList;
        channel.activeId = initChannelList[0].channel_id;
        return channel;
      });
    } else {
      setChannel((channel) => {
        channel.list = channel.list.filter((item) => item.channel_id !== id);
        if (id === channel.activeId) {
          channel.activeId = channel.list[0].channel_id;
        }
        return channel;
      });
    }
  };

  const onClearChannel = () => {
    setChannel((channel) => {
      channel.list = initChannelList;
      channel.activeId = initChannelList[0].channel_id;
      return channel;
    });
  };

  const onToggleTheme = () => setTheme(nowTheme === "light" ? "dark" : "light");

  const onOpenPrompt = () => alert("Prompt Manage ToDo...");

  const onSettingOpen = () => setSettingOpen(true);

  React.useEffect(() => {
    setNowTheme(theme === "dark" ? "dark" : "light");
  }, [theme]);

  return (
    <Drawer
      className="md:hidden"
      overlayClassName="md:hidden"
      title={
        <div className="font-extrabold text-transparent text-xl">
          <span className="bg-clip-text bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90%">
            L - GPT
          </span>
        </div>
      }
      width="78%"
      open={open}
      onClose={onClose}
    >
      <div className="p-2 h-[calc(100%-3.5rem)] flex flex-col">
        <Button
          className="mb-2"
          type="primary"
          size="lg"
          block
          onClick={onAddChannel}
        >
          {t("new-chat")}
        </Button>
        <div className="flex-1 overflow-y-auto select-none">
          {channel.list.map((item) => (
            <div
              key={item.channel_id}
              onClick={() => onChangeChannel(item.channel_id)}
              className={twMerge(
                clsx(
                  "rounded-lg mb-1 cursor-pointer transition-colors overflow-hidden relative flex flex-col h-16 text-xs px-[0.5rem] gap-1 justify-center",
                  "hover:bg-gray-200/60 dark:hover:bg-slate-700/70",
                  {
                    "bg-sky-100 hover:bg-sky-100 dark:bg-slate-600 dark:hover:bg-slate-600":
                      item.channel_id === channel.activeId,
                  }
                )
              )}
            >
              <div className="flex justify-between items-center gap-2">
                <div
                  className={clsx(
                    "font-medium text-sm text-ellipsis pl-5 overflow-hidden whitespace-nowrap relative",
                    "text-black/90",
                    "dark:text-white/90"
                  )}
                >
                  {renderIcon(item.channel_icon)}
                  {item.channel_name || t("new-conversation")}
                </div>
                <div
                  className={clsx(
                    "text-neutral-500/90 dark:text-neutral-500 dark:group-hover:text-neutral-400 tabular-nums flex-none text-right",
                    {
                      "dark:text-neutral-400/80":
                        item.channel_id === channel.activeId,
                    }
                  )}
                >
                  {item.chat_list.length
                    ? item.chat_list.at(-1)?.time
                      ? format(
                          Number(item.chat_list.at(-1)?.time),
                          "MM-DD HH:mm:ss"
                        )
                      : ""
                    : ""}
                </div>
              </div>
              <div
                className={twMerge(
                  clsx(
                    "text-neutral-500/90 dark:text-neutral-500 dark:group-hover:text-neutral-400",
                    {
                      "dark:text-neutral-400":
                        item.channel_id === channel.activeId,
                    }
                  )
                )}
              >
                {item.chat_list.length} {t("messages")}
              </div>
              <Confirm
                title={t("delete-this-conversation")}
                content={t("delete-conversation")}
                trigger={
                  <div
                    className={clsx(
                      "right-2 bottom-1 absolute",
                      "text-black/90",
                      "dark:text-white/90"
                    )}
                    onClick={stopPropagation}
                  >
                    <AiOutlineDelete size={20} />
                  </div>
                }
                onOk={() => onDeleteChannel(item.channel_id)}
              />
            </div>
          ))}
        </div>
        <div className="h-[6rem] flex flex-col border-t gap-1 pt-1">
          <Confirm
            title={t("clear-all-conversation")}
            content={t("clear-conversation")}
            trigger={
              <div
                className={clsx(
                  "h-11 rounded-md text-sm cursor-pointer flex items-center gap-2 px-2 transition-colors",
                  "hover:bg-gray-200/60 text-black/90",
                  "dark:hover:bg-slate-700/70 dark:text-white/90"
                )}
              >
                <AiOutlineDelete size={16} /> {t("clear-all-conversation")}
              </div>
            }
            onOk={onClearChannel}
          />
          <div className="h-11 items-center justify-center flex">
            <div className="flex-1 flex justify-center">
              <div
                onClick={onToggleTheme}
                className={clsx(
                  "w-8 h-8 flex justify-center items-center cursor-pointer transition-colors rounded-md",
                  "hover:bg-gray-200/60",
                  "dark:hover:bg-slate-700/70"
                )}
              >
                {nowTheme === "light" ? (
                  <MdDarkMode size={20} />
                ) : (
                  <MdOutlineLightMode size={20} />
                )}
              </div>
            </div>
            <div className="flex-1 flex justify-center">
              <a
                href="https://github.com/Peek-A-Booo/L-GPT"
                target="_blank"
                className={clsx(
                  "w-8 h-8 flex justify-center items-center cursor-pointer transition-colors rounded-md",
                  "hover:bg-gray-200/60",
                  "dark:hover:bg-slate-700/70"
                )}
              >
                <AiFillGithub size={20} />
              </a>
            </div>
            <div className="flex-1 flex justify-center">
              <div
                onClick={onOpenPrompt}
                className={clsx(
                  "w-8 h-8 flex justify-center items-center cursor-pointer transition-colors rounded-md",
                  "hover:bg-gray-200/60",
                  "dark:hover:bg-slate-700/70"
                )}
              >
                <HiLightBulb size={20} />
              </div>
            </div>
            <div className="flex-1 flex justify-center">
              <div
                onClick={onSettingOpen}
                className={clsx(
                  "w-8 h-8 flex justify-center items-center cursor-pointer transition-colors rounded-md",
                  "hover:bg-gray-200/60",
                  "dark:hover:bg-slate-700/70"
                )}
              >
                <AiOutlineSetting size={20} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default MobileMenu;
