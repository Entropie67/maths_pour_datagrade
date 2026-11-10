<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { setPhraseDuree } from '../../../lib/components/time'

  let cursorTimeValue = 10

  let messageDuree: string
  $: messageDuree = setPhraseDuree(cursorTimeValue)

  const dispatch = createEventDispatcher()
</script>

<div class="flex flex-col">
  <input
    class="py-3"
    type="range"
    max="30"
    min="0"
    name="duration"
    id="duration"
    bind:value={cursorTimeValue}
    on:change={() => dispatch('change', cursorTimeValue)}
  />
  <label
    class="
      text-coopmaths-corpus dark:text-coopmathsdark-corpus"
    for="duration"
  >
    {messageDuree}
  </label>
</div>

<style lang="scss">
  // Styling Cross-Browser Compatible Range Inputs with Sass
  // Github: https://github.com/darlanrod/input-range-sass
  // @Author: Darlan Rod https://github.com/darlanrod
  // Version 1.5.3
  // MIT License

  @use 'sass:math';
  @use 'sass:color';

  $track-color: white !default;
  $track-color-dark-mode: #1a202c !default;
  $thumb-color: default !default; // coopmaths-action

  $thumb-radius: 999px !default;
  $thumb-height: 18px !default;
  $thumb-width: 18px !default;
  $thumb-shadow-size: 2px !default;
  $thumb-shadow-blur: 2px !default;
  $thumb-shadow-color: rgba(0, 0, 0, 0.2) !default;
  $thumb-border-width: 2px !default;
  $thumb-border-color: #eceff1 !default;

  $track-width: 100% !default;
  $track-height: 5px !default;
  $track-shadow-size: 0px !default;
  $track-shadow-blur: 1px !default;
  $track-shadow-color: rgba(0, 0, 0, 0.2) !default;
  $track-border-width: 1px !default;
  $track-border-color: #cfd8dc !default;
  $track-radius: 5px !default;

  $contrast: 5% !default;
  $ie-bottom-track-color: color.adjust(
    $track-color,
    $lightness: -$contrast
  ) !default;

  @mixin shadow($shadow-size, $shadow-blur, $shadow-color) {
    box-shadow:
      $shadow-size $shadow-size $shadow-blur $shadow-color,
      0 0 $shadow-size color.adjust($shadow-color, $lightness: $contrast);
  }

  @mixin track {
    cursor: default;
    height: $track-height;
    transition: all 0.2s ease;
    width: $track-width;
  }

  @mixin thumb {
    @include shadow(
      $thumb-shadow-size,
      $thumb-shadow-blur,
      $thumb-shadow-color
    );
    background: $thumb-color;
    border: $thumb-border-width solid $thumb-border-color;
    border-radius: $thumb-radius;
    box-sizing: border-box;
    cursor: default;
    height: $thumb-height;
    width: $thumb-width;
  }

  [type='range'] {
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
    margin: math.div($thumb-height, 2) 0;
    width: $track-width;

    &::-moz-focus-outer {
      border: 0;
    }

    &:focus {
      outline: 0;

      &::-webkit-slider-runnable-track {
        background: color.adjust($track-color, $lightness: $contrast);
      }

      &::-ms-fill-lower {
        background: $track-color;
      }

      &::-ms-fill-upper {
        background: color.adjust($track-color, $lightness: $contrast);
      }
    }

    &::-webkit-slider-runnable-track {
      @include track;
      @include shadow(
        $track-shadow-size,
        $track-shadow-blur,
        $track-shadow-color
      );
      background: $track-color;
      border: $track-border-width solid $track-border-color;
      border-radius: $track-radius;
    }

    &::-webkit-slider-thumb {
      @include thumb;
      -webkit-appearance: none;
      margin-top: (
        math.div((-$track-border-width * 2 + $track-height), 2) - math.div(
            $thumb-height,
            2
          )
      );
    }

    &::-moz-range-track {
      @include shadow(
        $track-shadow-size,
        $track-shadow-blur,
        $track-shadow-color
      );
      @include track;
      background: $track-color;
      border: $track-border-width solid $track-border-color;
      border-radius: $track-radius;
      height: math.div($track-height, 2);
    }

    &::-moz-range-thumb {
      @include thumb;
    }

    &::-ms-track {
      @include track;
      background: transparent;
      border-color: transparent;
      border-width: math.div($thumb-height, 2) 0;
      color: transparent;
    }

    &::-ms-fill-lower {
      @include shadow(
        $track-shadow-size,
        $track-shadow-blur,
        $track-shadow-color
      );
      background: $ie-bottom-track-color;
      border: $track-border-width solid $track-border-color;
      border-radius: ($track-radius * 2);
    }

    &::-ms-fill-upper {
      @include shadow(
        $track-shadow-size,
        $track-shadow-blur,
        $track-shadow-color
      );
      background: $track-color;
      border: $track-border-width solid $track-border-color;
      border-radius: ($track-radius * 2);
    }

    &::-ms-thumb {
      @include thumb;
      margin-top: math.div($track-height, 4);
    }

    &:disabled {
      &::-webkit-slider-thumb,
      &::-moz-range-thumb,
      &::-ms-thumb,
      &::-webkit-slider-runnable-track,
      &::-ms-fill-lower,
      &::-ms-fill-upper {
        cursor: not-allowed;
      }
    }
  }
</style>
