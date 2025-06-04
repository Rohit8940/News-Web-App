import { FormControl } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import "./styles.css";
import { IconButton, Spinner, useToast } from "@chakra-ui/react";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { ArrowBackIcon, AttachmentIcon } from "@chakra-ui/icons";
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";

import io from "socket.io-client";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { ChatState } from "../Context/ChatProvider";

const ENDPOINT = process.env.REACT_APP_BACKEND_URL;

let socket;
let selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const toast = useToast();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const { selectedChat, setSelectedChat, user, notification, setNotification } =
    ChatState();

  // useRef to keep track of last typing time (prevents stale closures)
  const lastTypingTimeRef = useRef(null);

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`/api/message/${selectedChat._id}`, config);
      setMessages(data);
      setLoading(false);
      socket.emit("join chat", selectedChat._id);
      selectedChatCompare = selectedChat; // Sync the compare var here to current selected chat
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: "Failed to load the messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage.trim()) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        const { data } = await axios.post(
          `${ENDPOINT}/api/message`,
          {
            content: newMessage,
            chatId: selectedChat._id, // FIXED: pass chat ID, not entire object
          },
          config
        );
        socket.emit("new message", data);
        setMessages((prevMessages) => [...prevMessages, data]);
      } catch (error) {
        toast({
          title: "Error!",
          description: "Failed to send the message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        // Optional: reload fallback if needed
        // sessionStorage.setItem('currentPath', window.location.pathname);
        // window.location.reload();
      }
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("chatId", selectedChat._id);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "multipart/form-data",
        },
      };
      const { data } = await axios.post(`${ENDPOINT}/api/message/file`, formData, config);
      setSelectedFile(null);
      socket.emit("new message", data);
      setMessages((prevMessages) => [...prevMessages, data]);
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: "Failed to upload the file",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  // Initialize socket connection once
  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    // Clean up on component unmount to avoid multiple socket listeners
    return () => {
      socket.off("connected");
      socket.off("typing");
      socket.off("stop typing");
    };
  }, [user]);

  // Fetch messages whenever selectedChat changes
  useEffect(() => {
    fetchMessages();
  }, [selectedChat]);

  // Listen for new messages once socketConnected and messages are ready
  useEffect(() => {
    if (!socket) return;

    const messageReceivedHandler = (newMessageReceived) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageReceived.chat._id
      ) {
        // Add to notifications only if not already there
        if (!notification.find((notif) => notif._id === newMessageReceived._id)) {
          setNotification([newMessageReceived, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages((prevMessages) => [...prevMessages, newMessageReceived]);
      }
    };

    socket.on("message received", messageReceivedHandler);

    return () => {
      socket.off("message received", messageReceivedHandler);
    };
  }, [notification, fetchAgain, selectedChat]);

  // Typing indicator handler with debounce logic
  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    lastTypingTimeRef.current = new Date().getTime();

    setTimeout(() => {
      const timeNow = new Date().getTime();
      const timeDiff = timeNow - lastTypingTimeRef.current;
      if (timeDiff >= 3000 && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, 3000);
  };

  return (
    <Box
      display="flex"
      flexDir="column"
      justifyContent="flex-end"
      p={3}
      bg="#f7e7ce"
      w="100%"
      h="100%"
      borderRadius="lg"
      overflowY="hidden"
    >
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat(null)}
            />
            {messages &&
              (!selectedChat.isGroupChat ? (
                <>
                  {getSender(user, selectedChat.users)}
                  <ProfileModal user={getSenderFull(user, selectedChat.users)} />
                </>
              ) : (
                <>
                  {selectedChat.chatName.toUpperCase()}
                  <UpdateGroupChatModal
                    fetchMessages={fetchMessages}
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                  />
                </>
              ))}
          </Text>
          {loading ? (
            <Spinner size="xl" w={20} h={20} alignSelf="center" margin="auto" />
          ) : (
            <div className="messages">
              <ScrollableChat messages={messages} />
            </div>
          )}

          <FormControl onKeyDown={sendMessage} isRequired mt={3}>
            {istyping && (
              <Box mb={2}>
                <Lottie
                  options={defaultOptions}
                  width={70}
                  style={{ marginLeft: 0 }}
                />
              </Box>
            )}
            <Box display="flex" alignItems="center">
              <Input
                variant="filled"
                bg="#E0E0E0"
                placeholder="Enter a message.."
                value={newMessage}
                onChange={typingHandler}
                mr={2}
              />
              <Input
                type="file"
                onChange={handleFileChange}
                display="none"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <IconButton icon={<AttachmentIcon />} as="span" />
              </label>
              <IconButton
                icon={<ArrowBackIcon />}
                onClick={handleFileUpload}
                ml={2}
                isDisabled={!selectedFile}
                aria-label="Upload file"
              />
            </Box>
          </FormControl>
        </>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          h="100%"
          bg="#f7e7ce"
        >
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default SingleChat;
