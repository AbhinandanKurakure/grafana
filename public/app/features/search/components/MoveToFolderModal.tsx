import React, { Dispatch, FC, useState } from 'react';
import { css } from 'emotion';
import { Button, HorizontalGroup, Modal, stylesFactory, useTheme } from '@grafana/ui';
import { AppEvents, GrafanaTheme } from '@grafana/data';
import { FolderPicker } from 'app/core/components/Select/FolderPicker';
import appEvents from 'app/core/app_events';
import { backendSrv } from 'app/core/services/backend_srv';
import { DashboardSection, SearchAction } from '../types';
import { getCheckedDashboardsUids } from '../utils';
import { MOVE_ITEMS } from '../reducers/actionTypes';

interface Props {
  dispatch: Dispatch<SearchAction>;
  results: DashboardSection[];
  isOpen: boolean;
  onDismiss: () => void;
}

export const MoveToFolderModal: FC<Props> = ({ results, dispatch, isOpen, onDismiss }) => {
  const [folder, setFolder] = useState(null);
  const theme = useTheme();
  const styles = getStyles(theme);
  const selectedDashboards = getCheckedDashboardsUids(results);

  const moveTo = () => {
    const folderTitle = folder.title ?? 'General';

    backendSrv.moveDashboards(selectedDashboards, folder).then((result: any) => {
      if (result.successCount > 0) {
        const header = `Dashboard${result.successCount === 1 ? '' : 's'} Moved`;
        const msg = `${result.successCount} dashboard${result.successCount === 1 ? '' : 's'} moved to ${folderTitle}`;
        appEvents.emit(AppEvents.alertSuccess, [header, msg]);
      }

      if (result.totalCount === result.alreadyInFolderCount) {
        appEvents.emit(AppEvents.alertError, ['Error', `Dashboards already belongs to folder ${folderTitle}`]);
      }

      dispatch({ type: MOVE_ITEMS, payload: { dashboards: selectedDashboards, folder } });
      onDismiss();
    });
  };

  return (
    <Modal
      className={styles.modal}
      title="Choose Dashboard Folder"
      icon="folder-plus"
      isOpen={isOpen}
      onDismiss={onDismiss}
    >
      <>
        <div className={styles.content}>
          <p>
            Move the {selectedDashboards.length} selected dashboard{selectedDashboards.length === 1 ? '' : 's'} to the
            following folder:
          </p>
          <FolderPicker onChange={folder => setFolder(folder)} useNewForms />
        </div>

        <HorizontalGroup justify="center">
          <Button variant="primary" onClick={moveTo}>
            Move
          </Button>
          <Button variant="secondary" onClick={onDismiss}>
            Cancel
          </Button>
        </HorizontalGroup>
      </>
    </Modal>
  );
};

const getStyles = stylesFactory((theme: GrafanaTheme) => {
  return {
    modal: css`
      width: 500px;
    `,
    content: css`
      margin-bottom: ${theme.spacing.lg};
    `,
  };
});
