const JOYSTICK_RADIUS = 64;
const LEFT_ZONE_RATIO = 0.45;
const DEAD_ZONE = 8;

export class InputManager {
  constructor({ element, onMove, onAim, onJoystick }) {
    this.element = element;
    this.onMove = onMove;
    this.onAim = onAim;
    this.onJoystick = onJoystick;
    this.joystickRadius = JOYSTICK_RADIUS;

    this.movementPointerId = null;
    this.actionPointerId = null;
    this.movementStart = null;

    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);

    this.element.addEventListener("pointerdown", this.handlePointerDown);
    this.element.addEventListener("pointermove", this.handlePointerMove);
    this.element.addEventListener("pointerup", this.handlePointerUp);
    this.element.addEventListener("pointercancel", this.handlePointerUp);
  }

  dispose() {
    this.element.removeEventListener("pointerdown", this.handlePointerDown);
    this.element.removeEventListener("pointermove", this.handlePointerMove);
    this.element.removeEventListener("pointerup", this.handlePointerUp);
    this.element.removeEventListener("pointercancel", this.handlePointerUp);
  }

  handlePointerDown(event) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (event.target.closest("[data-ui-button='true']")) return;

    const rect = this.element.getBoundingClientRect();
    const localX = event.clientX - rect.left;
    const split = rect.width * LEFT_ZONE_RATIO;

    if (localX <= split && this.movementPointerId === null) {
      this.movementPointerId = event.pointerId;
      this.movementStart = { x: event.clientX, y: event.clientY };
      this.element.setPointerCapture(event.pointerId);
      this.updateMovement(event.clientX, event.clientY);
      return;
    }

    if (localX > split && this.actionPointerId === null) {
      this.actionPointerId = event.pointerId;
      this.element.setPointerCapture(event.pointerId);
      this.updateAim(event.clientX, event.clientY);
    }
  }

  handlePointerMove(event) {
    if (event.pointerType === "mouse") {
      this.updateAim(event.clientX, event.clientY);
    }

    if (event.pointerId === this.movementPointerId) {
      this.updateMovement(event.clientX, event.clientY);
    }

    if (event.pointerId === this.actionPointerId) {
      this.updateAim(event.clientX, event.clientY);
    }
  }

  handlePointerUp(event) {
    if (this.element.hasPointerCapture(event.pointerId)) {
      this.element.releasePointerCapture(event.pointerId);
    }
    if (event.pointerId === this.movementPointerId) {
      this.movementPointerId = null;
      this.movementStart = null;
      this.onMove?.({ x: 0, y: 0 });
      this.onJoystick?.({
        active: false,
        start: { x: 0, y: 0 },
        current: { x: 0, y: 0 },
        vector: { x: 0, y: 0 },
        radius: this.joystickRadius,
      });
    }

    if (event.pointerId === this.actionPointerId) {
      this.actionPointerId = null;
    }
  }

  updateMovement(clientX, clientY) {
    if (!this.movementStart) return;
    const dx = clientX - this.movementStart.x;
    const dy = clientY - this.movementStart.y;
    const distance = Math.hypot(dx, dy);
    const clampedDistance = Math.min(distance, this.joystickRadius);
    const angle = Math.atan2(dy, dx);
    const clampedX = Math.cos(angle) * clampedDistance;
    const clampedY = Math.sin(angle) * clampedDistance;

    const vector = {
      x: distance < DEAD_ZONE ? 0 : clampedX / this.joystickRadius,
      y: distance < DEAD_ZONE ? 0 : -clampedY / this.joystickRadius,
    };

    this.onMove?.(vector);
    this.onJoystick?.({
      active: true,
      start: { ...this.movementStart },
      current: { x: this.movementStart.x + clampedX, y: this.movementStart.y + clampedY },
      vector,
      radius: this.joystickRadius,
    });
  }

  updateAim(clientX, clientY) {
    const x = (clientX / window.innerWidth) * 2 - 1;
    const y = -(clientY / window.innerHeight) * 2 + 1;
    this.onAim?.({ x, y });
  }
}
