import React, {
  useRef,
  useState,
  ReactNode,
  useContext,
  createContext,
} from "react";
import ModalComponent from "@components/ModalComponent";

interface ModalContextProps {
  openModal: (title: string, body: ReactNode, buttons: ReactNode) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextProps | undefined>(undefined);

/**
 * Provides a context for managing a modal's state and behavior.
 *
 * This context allows components to open and close a modal, as well as set its title, body, and buttons.
 *
 * @component
 * @param {ReactNode} children - The child components that will have access to the modal context.
 *
 * @context
 * @property {boolean} isOpen - Indicates whether the modal is currently open.
 * @property {string} title - The title of the modal.
 * @property {ReactNode} body - The content/body of the modal.
 * @property {ReactNode} buttons - The buttons to be displayed in the modal.
 * @property {function} openModal - Function to open the modal with a specified title, body, and buttons.
 * @property {function} closeModal - Function to close the modal and reset its state.
 */
export const ModalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [body, setBody] = useState<ReactNode>(null);
  const [buttons, setButtons] = useState<ReactNode>(null);
  const [hideModal, setHideModal] = useState<boolean>(true);
  const idTimeout = useRef<NodeJS.Timeout | null>(null);

  const clearIdTimeout = () => {
    if (!idTimeout.current) return;

    clearTimeout(idTimeout.current);
    idTimeout.current = null;
  };

  /**
   * Opens a modal with the specified title, body, and buttons.
   *
   * @param modalTitle - The title to display in the modal.
   * @param modalBody - The content to display in the body of the modal. This should be a ReactNode.
   * @param modalButtons - The buttons to display in the modal footer. This should be a ReactNode.
   *
   * @remarks
   * This function clears any existing timeout before setting the modal's title, body, and buttons,
   * and then opens the modal by setting its state to open.
   */
  const openModal = (
    modalTitle: string,
    modalBody: ReactNode,
    modalButtons: ReactNode
  ) => {
    clearIdTimeout();

    setTitle(modalTitle);
    setBody(modalBody);
    setButtons(modalButtons);
    setIsOpen(true);
  };

  /**
   * Closes the modal by performing the following actions:
   * - Clears any existing timeout using `clearIdTimeout`.
   * - Sets the modal's open state to `false`.
   * - Schedules a timeout to reset the modal's title, body, and buttons after 1 second.
   *
   * Note: Ensure that `clearIdTimeout` properly clears the timeout stored in `idTimeout.current`.
   */
  const closeModal = () => {
    clearIdTimeout();

    setIsOpen(false);
    idTimeout.current = setTimeout(() => {
      setTitle("");
      setBody(null);
      setButtons(null);
    }, 1000);
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      <ModalComponent
        onClose={closeModal}
        title={title}
        body={body}
        buttons={buttons}
        isOpen={isOpen}
        hideModal={hideModal}
        setHideModal={setHideModal}
      />
      {children}
    </ModalContext.Provider>
  );
};

/**
 * Custom hook to access the ModalContext.
 *
 * This hook provides the context value for managing modal state and actions.
 * It ensures that the hook is used within a `ModalProvider` by throwing an error
 * if the context is not available.
 *
 * @throws {Error} If the hook is used outside of a `ModalProvider`.
 * @returns {ModalContextProps} The context value for modal management.
 *
 * @example
 *  const { openModal, closeModal } = useModal();
 *
 *  const handlePress = () => {
 *    const customStyles = StyleSheet.create({
 *      button: { backgroundColor: "black" },
 *      textButton: { color: "green" },
 *    });
 *    openModal(
 *      "Test Modal",
 *      <Text>This is a test modal body</Text>,
 *      <ButtonComponent
 *        label="Close Modal"
 *        handlePress={closeModal}
 *        customStyles={customStyles}
 *      />
 *    );
 *  };
 */
export const useModal = (): ModalContextProps => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
