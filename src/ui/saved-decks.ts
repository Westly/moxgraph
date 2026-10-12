import type { Library } from '../storage/model';
import { escapeHtml as h, icon, type IconName } from './components';

function action(name: IconName, label: string, attributes: string, tooltip = label, style = ''): string {
  return `<button type="button" class="library-icon ${style}" ${attributes} aria-label="${h(label)}" title="${h(tooltip)}">${icon(name)}<span class="tooltip" aria-hidden="true">${h(tooltip)}</span></button>`;
}

export function savedDecks(library: Library, canUndo: boolean): string {
  const { decks, selectedId } = library;
  return `<section class="saved-section" aria-labelledby="saved-decks-heading">
    <div class="section-heading"><h2 id="saved-decks-heading">Your saved decks (${decks.length})</h2>
      <div class="library-actions" role="group" aria-label="Saved deck actions">
        ${decks.length ? action('download', 'Export decks', 'data-export', 'Export decks', 'primary') : ''}
        ${action('archive', 'Download backup', 'data-backup')}
        ${action('upload', 'Restore backup', 'data-restore data-library-action')}
        ${canUndo ? action('undo', 'Undo last removal', 'data-undo data-library-action') : ''}
        ${decks.length ? action('trash', 'Clear all decks', 'data-clear-library data-library-action', 'Clear all decks', 'danger') : ''}
      </div>
    </div>
    ${decks.length ? `<div class="saved-table-wrap"><table class="saved-table" aria-labelledby="saved-decks-heading">
      <thead><tr><th scope="col">Deck</th><th scope="col" class="saved-card-count">Cards</th><th scope="col" class="saved-actions-heading">Actions</th></tr></thead>
      <tbody>${decks.map(entry => `<tr${entry.id === selectedId ? ' class="is-current"' : ''}>
        <th scope="row"><button class="saved-deck-name" data-open-deck="${h(entry.id)}" data-library-action${entry.id === selectedId ? ' aria-current="true"' : ''}><span>${h(entry.title)}</span></button></th>
        <td class="saved-card-count">${entry.result.deck.lines.reduce((total, line) => total + line.quantity, 0).toLocaleString()}</td>
        <td><div class="saved-row-actions">
          ${action('download', `Export ${entry.title}`, `data-export="${h(entry.id)}"`, 'Export')}
          ${action('edit', `Rename ${entry.title}`, `data-rename="${h(entry.id)}" data-library-action`, 'Rename')}
          ${action('trash', `Delete ${entry.title}`, `data-delete="${h(entry.id)}" data-library-action`, 'Delete', 'danger')}
        </div></td>
      </tr>`).join('')}</tbody>
    </table></div>` : '<div class="saved-empty"><div><strong>Your next signing list starts here.</strong><p>Import a deck to see its exact printings grouped by artist.</p></div></div>'}
  </section>`;
}
