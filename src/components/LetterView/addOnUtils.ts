import { v4 as uuidv4 } from "uuid";
import { StickerType } from "../AddOns/useSticker";
import { LetterType, containerId, selectRandomly } from "./letter";
import { select, getCssProperty, getNumberFromPx, isNumber, getTemplate, selectFrom, selectAllFrom, getNumberFromUnit, noop } from "@/utils";
import { CSSProperties } from "react";
import { EmojiType } from "../AddOns/useEmoji";

type AddOnSize = {
    width: number;
    height: number;
}

export type AddOnTypeBase = {
    id: string;
    position: Vector2;
    size?: AddOnSize;  // Width and height to be added when it enters the DOM
    rotation?: number;
    letterId: LetterType['id'];
};

type StickerAddOn = AddOnTypeBase & {
    name: StickerType;
    type: 'sticker';
};

type EmojiAddOn = AddOnTypeBase & {
    name: EmojiType;
    type: 'emoji';
};

export type AddOnType = StickerAddOn | EmojiAddOn;
export type Vector2Type = { x: number, y: number };
class Vector2 implements Vector2Type {
    x: number;
    y: number;

    constructor(x: number = 50, y: number = 50) {
        this.x = x;
        this.y = y;
    }
}
export class SingleAddOn implements AddOnTypeBase {
    id;
    name: AddOnType['name'];
    type: AddOnType['type'];
    letterId: string;
    position = selectRandomly([
        { x: -22.630675836930457, y: 623.2240437170263 },
        { x: 417.9183594964029, y: 630.162147146283 },
        { x: -15.221022659472423, y: -16.431391681055157 },
        { x: 434.1749355635492, y: -23.185283302158272 },
        { x: 168.0213534532374, y: 218.86984462829736 },
        { x: 182.19104637889689, y: 573.7188603117506 },
    ]);
    size?: AddOnSize | undefined;
    rotation?: number | undefined;

    constructor({ name = 'bff', letterId = 'unknown', type = 'sticker' }: Partial<AddOnType>) {
        this.id = uuidv4();
        this.name = name;
        this.type = type;
        this.letterId = letterId;
    }
}

type BoundaryFromType = {
    top: number;
    right: number;
    bottom: number;
    left: number;
}
export type EditAddOnType = (value: Partial<AddOnType>) => void;
export type DeleteAddOnType = (id: AddOnType['id']) => void;
export class EditableAddOnManager {
    addOn: SingleAddOn;
    editAddOn: EditAddOnType;
    deleteAddOn: DeleteAddOnType;
    addOnWrapperEl: HTMLDivElement;
    addOnEl: SVGElement | HTMLImageElement;
    containerEl: HTMLElement;
    letterViewEl: HTMLElement;
    containerContentEl: HTMLElement;
    papersEl: HTMLElement;
    wireFrameEl: HTMLElement;
    wireFrameElDisplay: 'none' | 'block' = 'none';
    wireFrameMoveEl: HTMLElement;
    wireFrameResizeEls: HTMLElement[];
    wireFrameRotateEl: HTMLElement;
    wireFrameDeleteEl: HTMLElement;
    addedEventListeners: {
        callback: (event: DocumentEventMap[keyof DocumentEventMap]) => void;
        target: EventTarget;
        type: keyof DocumentEventMap;
        options?: AddEventListenerOptions | boolean; // Add this line
    }[] = [];
    boundaryFrom: BoundaryFromType = {
        top: -500,
        right: -500,
        bottom: -500,
        left: -500,
    }
    aspectRatio: AddOnSize = {
        width: 0,
        height: 0,
    };

    origin: Vector2 = { x: 0, y: 0 };
    rotateOrigin: Vector2 = { x: 0, y: 0 };
    resizeAnchor: Vector2 = { x: 0, y: 0 };
    resizeOrigin: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' = 'bottom-right';
    resizeOriginCursorMap: {
        [key in typeof this.resizeOrigin]: CSSProperties['cursor'];
    } = {
            'top-left': 'grabbing',
            'top-right': 'grabbing',
            'bottom-left': 'grabbing',
            'bottom-right': 'grabbing',
        };
    currentAction: 'rotate' | 'resize' | 'move' | '' = '';

    renderingWireFrame: boolean = false;

    constructor(addOn: SingleAddOn, editAddOn: EditAddOnType, deleteAddOn: DeleteAddOnType) {
        this.addOn = addOn;
        this.editAddOn = editAddOn;
        this.deleteAddOn = deleteAddOn;
        this.addOnEl = select(`#add-${addOn.id}`) as SVGElement;
        this.addOnWrapperEl = this.addOnEl.parentElement as HTMLDivElement;
        this.letterViewEl = select(`#letter-view`) as HTMLElement;
        this.papersEl = select(`#letter-view-papers`) as HTMLElement;
        this.containerEl = select(`#${containerId}`) as HTMLElement;
        this.containerContentEl = select(`#${containerId}-content`) as HTMLElement;
        this.wireFrameEl = getTemplate('#wire-frame-el-template') as HTMLElement;
        this.wireFrameMoveEl = selectFrom('[data-action="move"]', this.wireFrameEl) as HTMLElement;
        this.wireFrameResizeEls = selectAllFrom('[data-action="resize"]', this.wireFrameEl) as unknown as HTMLElement[];
        this.wireFrameRotateEl = selectFrom('[data-action="rotate"]', this.wireFrameEl) as HTMLElement;
        this.wireFrameDeleteEl = selectFrom('[data-action="delete"]', this.wireFrameEl) as HTMLElement;

        // bind all functions to this instance
        for (const key of Object.getOwnPropertyNames(Object.getPrototypeOf(this))) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (typeof (this as any)[key] === 'function') {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (this as any)[key] = (this as any)[key].bind(this);
            }
        }

        // initialization
        this._registerDimensions();
        this._addEventListener(this.addOnEl, 'mouseenter', this._listenToShowWireFrame);
    }

    _getAddOnElRect() {
        return this.addOnEl.getBoundingClientRect();
    }

    _getContainerRect() {
        return this.containerEl.getBoundingClientRect();
    }

    _getLetterViewRect() {
        return this.letterViewEl.getBoundingClientRect();
    }

    _getLetterViewPapersRect() {
        return this.papersEl.getBoundingClientRect();
    }

    _getContainerContentRect() {
        return this.containerContentEl.getBoundingClientRect();
    }

    _getAddOnWrapperElRect() {
        return this.addOnWrapperEl.getBoundingClientRect();
    }

    _registerDimensions() {
        if (!isNumber(this.addOn.size?.height) || !isNumber(this.addOn.size?.width)) {
            if (this.addOnEl instanceof SVGElement) {
                const svgHeight = Number(this.addOnEl.getAttribute('height'));
                const svgWidth = Number(this.addOnEl.getAttribute('width'));
                console.log(svgHeight, svgWidth);
                this.aspectRatio = { height: svgHeight, width: svgWidth };
                this.editAddOn({ size: { height: svgHeight, width: svgWidth } });
            } else if (this.addOnEl instanceof HTMLImageElement) {
                if (!this.addOnEl.complete) this.addOnEl.onload = this._registerDimensions;
                const addonHeight = this.addOnEl.naturalHeight / 2;
                const addonWidth = this.addOnEl.naturalWidth / 2;
                this.aspectRatio = { height: addonHeight, width: addonWidth };
                this.editAddOn({ size: { height: addonHeight, width: addonWidth } })
            }
        } else {
            this.aspectRatio = { ...this.addOn.size };
        }
    }

    // Wireframing
    _listenToShowWireFrame() {
        this._addEventListener(this.wireFrameEl, 'mouseleave', this._listenToStopShowingWireFrame);
        this._addEventListener(this.wireFrameEl, 'click', this._listenToActivateWireFrame);
        this._addEventListener(this.wireFrameMoveEl, 'mousedown', this._listenToInitiateMove);
        this._addEventListener(this.wireFrameEl, 'keyup', this._deleteHandler);
        this._removeEventListener(this.addOnEl, 'mouseenter', this._listenToShowWireFrame);
        this._addEventListener(this.wireFrameRotateEl, 'mousedown', this._initiateRotate)
        this._addResizeEventListeners();
        this._addEventListener(this.wireFrameDeleteEl, 'click', this._deleteHandler);
        this._toggleWireFrame(true);
        this.renderingWireFrame = true;
        this._continuouslyRenderWireFrame();
    }

    _listenToActivateWireFrame() {
        this.wireFrameEl.tabIndex = 0;
        this.wireFrameEl.focus();
        this._addEventListener(this.wireFrameEl, 'focusout', this._listenToStopShowingWireFrame, { capture: true });
        this.wireFrameEl.classList.add('fully-editable');
        this._removeEventListener(this.wireFrameEl, 'mouseleave', this._listenToStopShowingWireFrame);
    }

    _listenToStopShowingWireFrame() {
        this.renderingWireFrame = false;
        this._toggleWireFrame(false);
        this._addEventListener(this.addOnEl, 'mouseenter', this._listenToShowWireFrame);
        this.wireFrameEl.classList.remove('fully-editable');
    }

    _toggleWireFrame(on: boolean) {
        this.wireFrameElDisplay = on ? 'block' : 'none';
        this.wireFrameEl.style.display = this.wireFrameElDisplay;

        if (this.wireFrameElDisplay === 'block') {
            document.body.appendChild(this.wireFrameEl)
        } else {
            this.wireFrameEl.parentElement?.removeChild(this.wireFrameEl);
        }
    }

    _continuouslyRenderWireFrame() {
        if (!this.renderingWireFrame) return;
        const PADDING = 10;

        const addOnWrapperElRect = this._getAddOnWrapperElRect();

        this.wireFrameEl.style.height = `${addOnWrapperElRect.height + (PADDING * 2)}px`;
        this.wireFrameEl.style.width = `${addOnWrapperElRect.width + (PADDING * 2)}px`;
        this.wireFrameEl.style.top = `${addOnWrapperElRect.y - PADDING}px`;
        this.wireFrameEl.style.left = `${addOnWrapperElRect.x - PADDING}px`;

        const rotate = getNumberFromUnit(getComputedStyle(this.addOnEl)['rotate'], 'deg');
        if (isNumber(rotate)) {
            this.wireFrameEl.style.rotate = `${rotate}deg`;
        }

        requestAnimationFrame(this._continuouslyRenderWireFrame);
    }

    removeWireFrameEl() {
        try {
            if (this.wireFrameEl) {
                this.wireFrameEl.remove();
                this.wireFrameEl = (null) as unknown as typeof this.wireFrameEl;
            }
        } catch (err) {
            noop(err);
        }
    }

    // Rotating
    _initiateRotate() {
        if (this.currentAction !== '') return;
        this.currentAction = 'rotate';
        this.startEdit();
        this._removeEventListener(this.wireFrameEl, 'mousedown', this._listenToInitiateMove);
        this._removeEventListener(this.wireFrameEl, 'mouseleave', this._listenToStopShowingWireFrame);
        this.wireFrameRotateEl.dataset.actionActive = 'true';
        this.wireFrameEl.dataset['editing'] = 'true';
        const addOnRect = this._getAddOnElRect();
        this.rotateOrigin = { x: addOnRect.x + (addOnRect.width / 2), y: addOnRect.y + (addOnRect.height / 2) };
        this._addEventListener(window, 'mousemove', this.rotate);
        this._addEventListener(window, 'mouseup', this.stopRotate);
        this.setUniversalCursor('grabbing');
    }

    rotate(evt: MouseEvent) {
        requestAnimationFrame(() => {
            if (this.currentAction !== 'rotate') return;
            const { clientX, clientY } = evt;
            const angle = this.getAngleBetweenPoints(this.rotateOrigin.x, this.rotateOrigin.y, clientX, clientY);
            this.addOnEl.style.rotate = `${angle - 90}deg`
        })
    }

    stopRotate() {
        this.currentAction = '';
        this.stopEdit();
        this._removeEventListener(window, 'mousemove', this.rotate);
        this._removeEventListener(window, 'mouseup', this.stopRotate);
        (select('[data-action-active="true"][data-action="rotate"]') as HTMLElement).dataset.actionActive = 'false';
        this.wireFrameEl.dataset['editing'] = 'false';
        this.resetUniversalCursor();
        const finalRotation = getNumberFromUnit(this.addOnEl.style.rotate, 'deg');
        if (isNumber(finalRotation)) {
            this.editAddOn({ rotation: finalRotation });
        }
        this.addOnEl.style.rotate = '';
    }

    getAngleBetweenPoints(x1: number, y1: number, x2: number, y2: number) {
        const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI); // Convert radians to degrees
        return angle < 0 ? angle + 360 : angle; // Ensure the angle is within [0, 360]
    }

    _deleteHandler(evt: KeyboardEvent | MouseEvent) {
        if (evt instanceof KeyboardEvent) {
            if (evt.key === 'Delete' || evt.key === 'Backspace') {
                this.deleteAddOn(this.addOn.id);
                this.removeWireFrameEl();
            }
        } else if (evt instanceof MouseEvent) {
            this.deleteAddOn(this.addOn.id);
            this.removeWireFrameEl();
        }
    }

    // Resizing
    _addResizeEventListeners() {
        Array.from(this.wireFrameResizeEls).forEach((el) => {
            this._addEventListener(el, 'mousedown', this._initiateResize)
        })
    }

    _initiateResize(evt: MouseEvent) {
        if (this.currentAction !== '') return;
        this.currentAction = 'resize';
        this.startEdit();
        this._removeEventListener(this.wireFrameEl, 'mousedown', this._listenToInitiateMove);
        this._removeEventListener(this.wireFrameEl, 'mouseleave', this._listenToStopShowingWireFrame);
        const { target } = evt;
        const resizeOrigin = (target as HTMLElement).dataset['resizeOrigin'];
        (target as HTMLElement).dataset.actionActive = 'true';
        this.wireFrameEl.dataset['editing'] = 'true';
        this.setUniversalCursor('grabbing')
        const addOnWrapperEl = this._getAddOnWrapperElRect();

        switch (resizeOrigin) {
            case 'top-left':
                this.resizeAnchor.x = addOnWrapperEl.x + addOnWrapperEl.width;
                this.resizeAnchor.y = addOnWrapperEl.y + addOnWrapperEl.height;
                break;
            case 'top-right':
                this.resizeAnchor.x = addOnWrapperEl.x;
                this.resizeAnchor.y = addOnWrapperEl.y + addOnWrapperEl.height;
                break;
            case 'bottom-left':
                this.resizeAnchor.x = addOnWrapperEl.x + addOnWrapperEl.width;
                this.resizeAnchor.y = addOnWrapperEl.y;
                break;
            case 'bottom-right':
                this.resizeAnchor.x = addOnWrapperEl.x;
                this.resizeAnchor.y = addOnWrapperEl.y;
                break;
        }
        this.resizeOrigin = resizeOrigin as typeof this.resizeOrigin;

        this.startEdit();
        this._addEventListener(window, 'mousemove', this.resize);
        this._addEventListener(window, 'mouseup', this.stopResize);
    }

    resize(evt: MouseEvent) {
        requestAnimationFrame(() => {
            if (this.currentAction !== 'resize') return;
            const { clientX, clientY } = evt;
            const containerRect = this._getContainerRect();
            const widthToHeightRatio = this.aspectRatio.width / this.aspectRatio.height;
            const differenceX = Math.abs(this.resizeAnchor.x - clientX);
            const differenceY = Math.abs(this.resizeAnchor.y - clientY);

            let newWidth;
            let newHeight;

            if (differenceX > differenceY) {
                newWidth = differenceX;
                newHeight = differenceX / widthToHeightRatio;

                this.addOnWrapperEl.style.width = `${newWidth}px`;
                this.addOnWrapperEl.style.height = `${newHeight}px`;
            } else {
                newWidth = differenceY * widthToHeightRatio;
                newHeight = differenceY;
                this.addOnWrapperEl.style.width = `${newWidth}px`;
                this.addOnWrapperEl.style.height = `${newHeight}px`;
            }

            if (this.resizeOrigin === 'top-left') {
                if (differenceX > differenceY) {
                    this.addOnWrapperEl.style.left = `${clientX - containerRect.x}px`;
                    this.addOnWrapperEl.style.top = `${(this.resizeAnchor.y - containerRect.y) - newHeight}px`;
                } else {
                    this.addOnWrapperEl.style.top = `${clientY - containerRect.y}px`;
                    this.addOnWrapperEl.style.left = `${(this.resizeAnchor.x - containerRect.x) - newWidth}px`;
                }
            } else if (this.resizeOrigin === 'top-right') {
                if (differenceX > differenceY) {
                    this.addOnWrapperEl.style.top = `${this.resizeAnchor.y - newHeight - containerRect.y}px`;
                } else {
                    this.addOnWrapperEl.style.top = `${clientY - containerRect.y}px`
                }
            } else if (this.resizeOrigin === 'bottom-left') {
                if (differenceX > differenceY) {
                    this.addOnWrapperEl.style.left = `${clientX - containerRect.x}px`;
                } else {
                    this.addOnWrapperEl.style.left = `${this.resizeAnchor.x - containerRect.x - newWidth}px`
                }
            }
        })
    }

    stopResize() {
        this.currentAction = '';
        this._removeEventListener(window, 'mousemove', this.resize);
        this._removeEventListener(window, 'mouseup', this.stopResize);
        (select('[data-action-active="true"][data-action="resize"]') as HTMLElement).dataset.actionActive = 'false';
        this.wireFrameEl.dataset['editing'] = 'false';
        this.resetUniversalCursor();
        const suNumber = Number(getCssProperty(this.addOnWrapperEl, '--su-number'));

        const finalWidth = getNumberFromPx(this.addOnWrapperEl.style.width);
        const finalHeight = getNumberFromPx(this.addOnWrapperEl.style.height);

        // some resize operations happen without changing top & left
        // this means the actual style value might be empty sometimes
        const finalTop = getNumberFromPx(getComputedStyle(this.addOnWrapperEl)['top']);
        const finalLeft = getNumberFromPx(getComputedStyle(this.addOnWrapperEl)['left']);

        if (isNumber(finalTop) &&
            isNumber(finalLeft) &&
            isNumber(finalWidth) &&
            isNumber(finalHeight)) {

            const normalizedTop = finalTop / suNumber;
            const normalizedLeft = finalLeft / suNumber;
            const normalizedHeight = finalHeight / suNumber;
            const normalizedWidth = finalWidth / suNumber;

            this.addOnWrapperEl.style.setProperty('--left', String(normalizedLeft));
            this.addOnWrapperEl.style.setProperty('--top', String(normalizedTop));
            this.addOnWrapperEl.style.setProperty('--width', String(normalizedWidth));
            this.addOnWrapperEl.style.setProperty('--height', String(normalizedHeight));

            const newPosition = {
                x: normalizedLeft,
                y: normalizedTop
            };
            const newSize = {
                width: normalizedWidth,
                height: normalizedHeight,
            }

            this.editAddOn({ position: newPosition, size: newSize });
        }

        this.addOnWrapperEl.style.left = "";
        this.addOnWrapperEl.style.top = "";
        this.addOnWrapperEl.style.width = "";
        this.addOnWrapperEl.style.height = "";
        this.stopEdit();
    }

    // Moving

    _listenToInitiateMove(evt: MouseEvent) {
        if (this.currentAction !== '') return;
        this.currentAction = 'move';
        this.startEdit();
        const { clientX, clientY } = evt;
        const addOnWrapperElRect = this._getAddOnWrapperElRect();
        this.origin.x = addOnWrapperElRect.x - clientX;
        this.origin.y = addOnWrapperElRect.y - clientY;

        this.setUniversalCursor('move');
        this._addEventListener(window, 'mousemove', this.move);
        this._addEventListener(window, 'mouseup', this.stopMove)
        this._removeEventListener(this.wireFrameEl, 'mouseleave', this._listenToStopShowingWireFrame);
    }

    move(evt: MouseEvent) {
        requestAnimationFrame(() => {
            if (this.currentAction !== 'move') return;
            const { clientX, clientY } = evt;

            const containerRect = this._getContainerRect();
            const addOnWrapperElRect = this._getAddOnWrapperElRect();

            const boundary = this.getBoundaryCoordinates(containerRect);
            const allowMove = this.checkPointWithinBoundary({ x: clientX, y: clientY }, boundary, addOnWrapperElRect);

            // x
            if (allowMove.cumulativeX) {
                this.addOnWrapperEl.style.left = `${clientX - containerRect.x + this.origin.x}px`;
            } else {
                if (!allowMove.maxX) {
                    this.addOnWrapperEl.style.left = `${(boundary.maxX - containerRect.x) - addOnWrapperElRect.width}px`;
                } else {
                    this.addOnWrapperEl.style.left = `${boundary.minX - containerRect.x}px`;
                }
            }

            // y
            if (allowMove.cumulativeY) {
                this.addOnWrapperEl.style.top = `${clientY - containerRect.y + this.origin.y}px`;
            } else {
                if (!allowMove.maxY) {
                    this.addOnWrapperEl.style.top = `${(boundary.maxY - containerRect.y) - addOnWrapperElRect.height}px`;
                } else {
                    this.addOnWrapperEl.style.top = `${boundary.minY - containerRect.y}px`;
                }
            }

        })
    }

    checkPointWithinBoundary(position: Vector2Type, boundary: ReturnType<typeof this.getBoundaryCoordinates>, elementRect: DOMRect) {
        const { minX, maxX, minY, maxY } = boundary;
        const withinBoundary = (
            {
                minX: ((position.x + this.origin.x) >= minX),
                maxX: ((position.x + this.origin.x) + elementRect.width <= maxX),
                minY: ((position.y + this.origin.y) >= minY),
                maxY: ((position.y + this.origin.y) + elementRect.height <= maxY),
            }
        );

        return {
            ...withinBoundary,
            cumulativeX: withinBoundary.maxX && withinBoundary.minX,
            cumulativeY: withinBoundary.maxY && withinBoundary.minY,
        }
    }

    getBoundaryCoordinates(bondaryRect: DOMRect) {
        const suNumber = Number(getCssProperty(this.addOnEl, '--su-number'));
        const minY = (bondaryRect.top + (this.boundaryFrom.top * suNumber));
        const maxY = (bondaryRect.bottom - (this.boundaryFrom.bottom * suNumber));
        const minX = (bondaryRect.left + (this.boundaryFrom.left * suNumber));
        const maxX = (bondaryRect.right - (this.boundaryFrom.right * suNumber));

        return {
            minX,
            maxX,
            minY,
            maxY
        }
    }

    stopMove() {
        this.stopEdit();
        this.resetUniversalCursor();
        this._removeEventListener(window, 'mousemove', this.move);
        this._removeEventListener(window, 'mouseup', this.stopMove);
        const finalTop = getNumberFromPx(this.addOnWrapperEl.style.top);
        const finalLeft = getNumberFromPx(this.addOnWrapperEl.style.left);
        if (isNumber(finalTop) && isNumber(finalLeft)) {
            const suNumber = Number(getCssProperty(this.addOnEl, '--su-number'));

            const normalizedTop = finalTop / suNumber;
            const normalizedLeft = finalLeft / suNumber;

            this.addOnWrapperEl.style.setProperty('--left', String(normalizedLeft));
            this.addOnWrapperEl.style.setProperty('--top', String(normalizedTop));

            this.editAddOn({ position: { x: normalizedLeft, y: normalizedTop } });
        }
        this.addOnWrapperEl.style.left = "";
        this.addOnWrapperEl.style.top = "";
        this.currentAction = '';
    }

    // Utilities
    _addEventListener<K extends keyof DocumentEventMap>(
        el: EventTarget,
        eventType: K,
        callback: (event: DocumentEventMap[K]) => void,
        options?: AddEventListenerOptions | boolean
    ) {
        el.addEventListener(eventType, callback as EventListener, options);
        // @ts-expect-error can't get it to work
        this.addedEventListeners.push({ target: el, callback, type: eventType, options });
    }

    _removeEventListener<K extends keyof DocumentEventMap>(
        el: EventTarget,
        eventType: K,
        callback: (event: DocumentEventMap[K]) => void
    ) {
        el.removeEventListener(eventType, callback as EventListener);
    }

    setUniversalCursor(cursor: CSSProperties['cursor'] = 'default') {
        document.documentElement.style.cursor = cursor;
    }

    resetUniversalCursor() {
        document.documentElement.style.cursor = '';
    }

    startEdit() {
        this.letterViewEl.classList.add('editing');
    }

    stopEdit() {
        this.letterViewEl.classList.remove('editing');
    }

    destroy() {
        this.removeWireFrameEl();
        this.addedEventListeners.forEach(({ callback, type, target }) => {
            this._removeEventListener(target, type, callback);
        })
    }
}