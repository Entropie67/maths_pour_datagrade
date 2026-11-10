<script lang="ts">
  export let message: string = ''
  export let visible = false
  export let onClose = () => {} // Callback pour la fermeture du popup

  function closePopup() {
    visible = false
    onClose()
  }
</script>

{#if visible}
  <button class="overlay" on:click={closePopup} aria-label="Close popup"
  ></button>
  <div class="popup">
    <p>{@html message}</p>
    <button class="button" on:click={closePopup}>Fermer</button>
  </div>
{/if}

<style>
  .popup {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: white;
    padding: 20px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    z-index: 1000;
  }
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }
  .button {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px 20px;
    font-size: 16px;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  .button:hover {
    background-color: #0056b3;
  }
  .button:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.5);
  }
</style>
