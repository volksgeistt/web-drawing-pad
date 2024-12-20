class DrawingPad {
    constructor() {
        this.canvas = document.getElementById('drawingCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.currentTool = 'pencil';
        this.color = '#ffffff';
        this.size = 5;
        this.startX = 0;
        this.startY = 0;
        this.lastDrawn = null;

        this.initializeCanvas();
        this.setupEventListeners();
    }

    initializeCanvas() {
        this.canvas.width = window.innerWidth - 40;
        this.canvas.height = window.innerHeight - 100;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.strokeStyle = this.color;
        this.ctx.fillStyle = this.color;
    }

    setupEventListeners() {
        document.querySelectorAll('.tool').forEach(tool => {
            tool.addEventListener('click', (e) => {
                document.querySelector('.tool.active')?.classList.remove('active');
                e.target.classList.add('active');
                this.currentTool = e.target.id;
            });
        });

        document.getElementById('colorPicker').addEventListener('input', (e) => {
            this.color = e.target.value;
        });

        document.getElementById('sizeSlider').addEventListener('input', (e) => {
            this.size = e.target.value;
            document.getElementById('sizeValue').textContent = `${this.size}px`;
        });

        this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
        this.canvas.addEventListener('mousemove', this.draw.bind(this));
        this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));

        document.getElementById('clear').addEventListener('click', () => {
            if (confirm('Are you sure you want to clear the canvas?')) {
                this.ctx.fillStyle = '#1a1a1a';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.fillStyle = this.color;
            }
        });

        document.getElementById('save').addEventListener('click', () => {
            const link = document.createElement('a');
            link.download = 'drawing.png';
            link.href = this.canvas.toDataURL();
            link.click();
        });

        this.canvas.addEventListener('click', (e) => {
            if (this.currentTool === 'text') {
                const text = prompt('Enter text:');
                if (text) {
                    this.ctx.font = `${this.size * 2}px Arial`;
                    this.ctx.fillStyle = this.color;
                    this.ctx.fillText(text, e.offsetX, e.offsetY);
                    this.ctx.fillStyle = this.color;
                }
            }
        });

        window.addEventListener('resize', () => {
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            this.initializeCanvas();
            this.ctx.putImageData(imageData, 0, 0);
        });
    }

    startDrawing(e) {
        this.isDrawing = true;
        this.startX = e.offsetX;
        this.startY = e.offsetY;
        this.lastDrawn = null;
        
        if (this.currentTool === 'pencil' || this.currentTool === 'eraser') {
            this.ctx.beginPath();
            this.ctx.moveTo(this.startX, this.startY);
        }
    }

    draw(e) {
        if (!this.isDrawing) return;

        const x = e.offsetX;
        const y = e.offsetY;

        this.ctx.strokeStyle = this.currentTool === 'eraser' ? '#1a1a1a' : this.color;
        this.ctx.lineWidth = this.size;

        if (this.lastDrawn && this.currentTool !== 'pencil' && this.currentTool !== 'eraser') {
            this.ctx.putImageData(this.lastDrawn, 0, 0);
        }

        switch (this.currentTool) {
            case 'pencil':
            case 'eraser':
                this.ctx.lineTo(x, y);
                this.ctx.stroke();
                break;
            case 'line':
                this.ctx.beginPath();
                this.ctx.moveTo(this.startX, this.startY);
                this.ctx.lineTo(x, y);
                this.ctx.stroke();
                break;
            case 'square':
                const width = x - this.startX;
                const height = y - this.startY;
                this.ctx.strokeRect(this.startX, this.startY, width, height);
                break;
            case 'circle':
                const radius = Math.sqrt(
                    Math.pow(x - this.startX, 2) + Math.pow(y - this.startY, 2)
                );
                this.ctx.beginPath();
                this.ctx.arc(this.startX, this.startY, radius, 0, Math.PI * 2);
                this.ctx.stroke();
                break;
            case 'triangle':
                const triangleHeight = y - this.startY;
                const triangleWidth = x - this.startX;
                this.ctx.beginPath();
                this.ctx.moveTo(this.startX, this.startY + triangleHeight);
                this.ctx.lineTo(this.startX + triangleWidth / 2, this.startY);
                this.ctx.lineTo(this.startX + triangleWidth, this.startY + triangleHeight);
                this.ctx.closePath();
                this.ctx.stroke();
                break;
        }

        if (!this.lastDrawn && this.currentTool !== 'pencil' && this.currentTool !== 'eraser') {
            this.lastDrawn = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    stopDrawing() {
        if (this.isDrawing) {
            this.isDrawing = false;
            this.lastDrawn = null;
        }
    }
}

window.addEventListener('load', () => {
    const drawingPad = new DrawingPad();
    drawingPad.ctx.fillStyle = '#1a1a1a';
    drawingPad.ctx.fillRect(0, 0, drawingPad.canvas.width, drawingPad.canvas.height);
    drawingPad.ctx.fillStyle = drawingPad.color;
});
