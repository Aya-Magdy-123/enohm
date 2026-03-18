import Modal from '../components/Modal';
import AddRequestForm from '../AddRequestForm';
import { useTranslation } from 'react-i18next';

function AddRequestModal({ onClose, setShowSuccessModal }) {
  const { t } = useTranslation();

  return (
    <Modal onClose={onClose}>
      <h1 className="font-bold text-xl px-2 text-blue-950 border-r-4 mb-3 border-r-orange-600 py-1">
        {t('addNewRequest')}
      </h1>
      <hr className="text-gray-200 rounded-full w-full mb-4" />
      <AddRequestForm setShowSuccessModal={setShowSuccessModal} />
    </Modal>
  );
}

export default AddRequestModal;