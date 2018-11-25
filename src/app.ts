import { Animation } from "./enc/animation";
import { MainMenuView } from "./mainMenuView";
import { GameView } from "./gameView";
import favicon from "./assets/favicon.png"

export class App {
    animation: Animation;
    menu: MainMenuView;
    game: GameView;

    public run() {
        this.animation = Animation.createInBody();
        this.changeFavicon(favicon)
        this.newGame();
    }

    changeFavicon(src: string) {
        var link = document.createElement('link'),
            oldLink = document.getElementById('dynamic-favicon');
        link.id = 'dynamic-favicon';
        link.rel = 'shortcut icon';
        link.href = src;
        if (oldLink) {
            document.head.removeChild(oldLink);
        }
        document.head.appendChild(link);
    }

    private start = () => {
        this.game = new GameView(this.menu.controllers);
        this.menu.hide();
        this.menu.requestStart.removeEventListener(this.start);
        this.menu = null;

        this.animation.addView(this.game);
        this.game.requestNewGame.addEventListener(this.newGame);
        this.game.start();
    }

    private newGame = () => {
        this.menu = new MainMenuView();
        this.menu.requestStart.addEventListener(this.start);
        if (this.game) {
            this.game.requestNewGame.removeEventListener(this.newGame);
            this.game.hide();
            this.game = null;
        }

        this.animation.addView(this.menu);
        this.menu.show();
    }
}