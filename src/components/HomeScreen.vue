<!-- HomeScreen -->
<template>
  <div class="home-container">
    <div class="header">
      <div class="left-section">
        <img
          class="profile"
          src="https://img.freepik.com/free-photo/handsome-young-cheerful-man-with-arms-crossed_171337-1073.jpg?semt=ais_rp_progressive&w=740&q=80"
          alt="profile picture"
        />
      </div>
      <div class="middle-section">
        <p>Hello, John!</p>
        <p>Lapasan, CDO</p>
      </div>
      <div>
        <img class="kuryenta-logo" src="src/assets/Kuryenta_logo.png" alt="Kuryenta-logo" />
      </div>
    </div>

    <div class="main-page">
      <div class="search-container">
        <input class="input-field" type="text" placeholder="Station ID" />
        <img class="search-icon" src="src/assets/search-icon.png" alt="" />
      </div>
      <div>
        this is the div
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style src="src/features/homePage/Header.css"></style>
<style src="src/features/homePage/MainPage.css"></style>
