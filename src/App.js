import React, { useState, useEffect } from 'react';

const App = () => {
  // État des listes et des tâches
  const [lists, setLists] = useState({});
  const [newTask, setNewTask] = useState('');
  const [newListName, setNewListName] = useState('');
  const [taskList, setTaskList] = useState('');
  const [showModal, setShowModal] = useState(false); // Contrôle de l'affichage du modal pour l'ajout de tâche
  const [taskToAdd, setTaskToAdd] = useState(''); // Tâche à ajouter (pour le modal)
  const [showClearModal, setShowClearModal] = useState(null); // Modal pour vider la liste

  const [showDeleteModal, setShowDeleteModal] = useState(null); // Modal pour confirmation suppression de liste

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  // Lorsque le service worker est activé
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Empêche le prompt d'installation automatique
      e.preventDefault();
      setDeferredPrompt(e); // Sauvegarde l'event pour une utilisation ultérieure
      setShowInstallButton(true); // Affiche le bouton personnalisé
    });

    // Nettoyage de l'écouteur d'événement lorsque le composant se démonte
    return () => {
      window.removeEventListener('beforeinstallprompt', (e) => { });
    };
  }, []);

  // Fonction pour afficher le prompt d'installation
  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt(); // Affiche le prompt
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('L’utilisateur a accepté le prompt d’installation');
        } else {
          console.log('L’utilisateur a refusé le prompt d’installation');
        }
        setDeferredPrompt(null); // Réinitialiser après utilisation
        setShowInstallButton(false); // Cacher le bouton
      });
    }
  };

  // Charger les listes et tâches depuis localStorage
  useEffect(() => {
    const savedLists = JSON.parse(localStorage.getItem('lists')) || {};
    setLists(savedLists);
  }, []);

  // Sauvegarder les listes dans localStorage à chaque mise à jour
  useEffect(() => {
    if (Object.keys(lists).length > 0) {
      localStorage.setItem('lists', JSON.stringify(lists));
    }
  }, [lists]);

  // Ajouter une nouvelle liste
  const handleAddList = (e) => {
    e.preventDefault();
    if (newListName.trim() && !lists[newListName]) {
      setLists(prevLists => ({ ...prevLists, [newListName]: [] }));
      setNewListName('');
    }
  };

  // Ajouter une nouvelle tâche avec vérification
  const handleAddTask = (e) => {
    e.preventDefault();
    if (newTask.trim() && taskList) {
      // Nous allons vérifier si la tâche existe déjà dans la liste, mais ne pas encore l'ajouter à l'état
      // if (lists[taskList].some(t => t.task === newTask)) {
      //   alert('Cette tâche existe déjà dans cette liste.');
      //   return;
      // }
      // Afficher le modal de confirmation avant l'ajout
      setTaskToAdd(newTask); // Préparer la tâche à ajouter
      setShowModal(true); // Afficher le modal pour confirmation
      setNewTask(''); // Réinitialiser le champ de saisie
    }
  };

  // Confirmer l'ajout de la tâche dans la liste
  const confirmAddTask = () => {
    setLists(prevLists => {
      const updatedLists = { ...prevLists };

      // On vérifie si la tâche n'existe pas déjà dans la liste
      if (!updatedLists[taskList].some(t => t.task === taskToAdd)) {
        updatedLists[taskList].push({ task: taskToAdd, checked: false });
      }

      // // Sauvegarder directement dans le localStorage
      // localStorage.setItem('lists', JSON.stringify(updatedLists)); // Mettre à jour le localStorage
      return updatedLists;
    });

    // Fermer le modal après l'ajout
    setShowModal(false);
    setTaskToAdd(''); // Réinitialiser la tâche à ajouter
  };

  // Annuler l'ajout de la tâche
  const cancelAddTask = () => {
    setShowModal(false); // Fermer le modal sans ajouter la tâche
    setTaskToAdd('');
  };

  // Effacer une liste
  const handleClearList = (listName) => {
    // setListToClear(listName);
    // setShowClearModal(true);

    setLists(prevLists => {
      const updatedLists = { ...prevLists };
      updatedLists[listName] = [];
      localStorage.setItem('lists', JSON.stringify(updatedLists)); // Mise à jour du localStorage
      return updatedLists;

    });
    setShowClearModal(null); // Fermer le modal

  };



  // Supprimer une liste
  const handleDeleteList = (listName) => {
    // setListToDelete(listName);
    // setShowDeleteListModal(true);
    const { [listName]: _, ...rest } = lists;
    setLists(rest);
    setShowDeleteModal(null); // Fermer le modal
    localStorage.setItem('lists', JSON.stringify(rest)); // Mise à jour du localStorage

  };


  // Désactiver le bouton supprimer si la liste n'est pas vide
  const isDeleteButtonDisabled = (listName) => {
    return lists[listName].length > 0;
  };


  // Afficher le modal de vidage de la liste
  const openClearModal = (listName) => {
    setShowClearModal(listName);
  };

  // Afficher le modal de suppression de la liste
  const openDeleteModal = (listName) => {
    setShowDeleteModal(listName);
  };

  // Marquer une tâche comme faite ou la décocher
  const handleTaskClick = (listName, task) => {
    setLists(prevLists => {
      const updatedLists = { ...prevLists };
      updatedLists[listName] = updatedLists[listName].map(t =>
        t.task === task.task ? { ...t, checked: !t.checked } : t
      );
      localStorage.setItem('lists', JSON.stringify(updatedLists));
      // Mise à jour du localStorage
      return updatedLists;
    });
  };

  // Supprimer une tâche si elle est cochée
  const handleDeleteCheckedTask = (listName, task) => {
    setLists(prevLists => {
      const updatedLists = { ...prevLists };
      updatedLists[listName] = updatedLists[listName].filter(t => t.task !== task.task);
      localStorage.setItem('lists', JSON.stringify(updatedLists)); // Mise à jour du localStorage
      return updatedLists;
    });
  };

  return (
    <div className='container'>
      <img src="././icon-192x192.png" alt="logo-to-list" id='logo' />
      <h1>Mum To-Do List</h1>

      {/* Création d'une nouvelle liste */}
      <form onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          value={newListName}
          onChange={e => setNewListName(e.target.value)}
          placeholder="Nom de la nouvelle liste"
          id="item" autoComplete="off" minLength={2}
        />
        <button className='newList' onClick={handleAddList}>Créer Liste</button>

        {/* Ajouter une nouvelle tâche */}
        <input
          type="text"
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          placeholder="Nouvelle tâche"
        />
        <select onChange={e => setTaskList(e.target.value)}>
          <option value="">Choisir une liste</option>
          {Object.keys(lists).map((listName) => (
            <option key={listName} value={listName}>{listName}</option>
          ))}
        </select>
        <button className='newList' onClick={handleAddTask}>Ajouter Tâche</button>

        {/* Modal de confirmation avant ajout de tâche */}
        {showModal && (
          <div className="modal">
            <p>Voulez-vous ajouter "{taskToAdd}" à la liste {taskList} ?</p>
            <button onClick={confirmAddTask}>Oui</button>
            <button onClick={cancelAddTask}>Non</button>
          </div>
        )}

      </form>



      {/* Affichage des listes */}
      <div>
        {Object.keys(lists).map((listName) => (
          <div key={listName}>
            <h2>{listName}</h2>
            <ul>
              {lists[listName].map((task, index) => (
                <li
                  key={index}
                  onClick={() => handleTaskClick(listName, task)}
                  style={{ textDecoration: task.checked ? 'line-through' : 'none' }}
                >
                  {task.task}
                  {task.checked && (
                    <button onClick={() => handleDeleteCheckedTask(listName, task)}>Supprimer</button>
                  )}
                </li>
              ))}
            </ul>
            {/* Boutons pour vider et supprimer une liste */}
            <button
              onClick={() => openClearModal(listName)}
              disabled={lists[listName].length === 0} // Désactive le bouton si la liste est vide
            >
              Vider Liste
            </button>
            <button onClick={() => openDeleteModal(listName)} disabled={isDeleteButtonDisabled(listName)}>
              Supprimer Liste
            </button>

            {/* Modal de confirmation de vidage de la liste */}
            {showClearModal === listName && (
              <div className="modal">
                <p>Voulez-vous vider la liste {listName} ?</p>
                <button onClick={() => handleClearList(listName)}>Oui</button>
                <button onClick={() => setShowClearModal(null)}>Non</button>
              </div>
            )}

            {/* Modal de confirmation de suppression de la liste */}
            {showDeleteModal === listName && (
              <div className="modal">
                <p>Voulez-vous supprimer la liste {listName} ?</p>
                <button onClick={() => handleDeleteList(listName)}>Oui</button>
                <button onClick={() => setShowDeleteModal(null)}>Non</button>
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Affichage du bouton d'installation */}
      {showInstallButton && (
        <button onClick={handleInstallClick}>
          Installer l'application
        </button>
      )}
    </div>
  );
};

export default App;

