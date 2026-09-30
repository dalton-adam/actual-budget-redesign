import React from 'react';

import { Button } from '@actual-app/components/button';
import { View } from '@actual-app/components/view';

import { useTagCSS } from '#hooks/useTagCSS';

type DesktopTaggedNotesProps = {
  content: string;
  onPress?: (content: string) => void;
  tag: string;
  separator: string;
  square?: boolean;
};

export function DesktopTaggedNotes({
  content,
  onPress,
  tag,
  separator,
  square,
}: DesktopTaggedNotesProps) {
  const getTagCSS = useTagCSS();
  return (
    <View style={{ display: 'inline' }}>
      <Button
        variant="bare"
        className={getTagCSS(tag, { square })}
        onPress={() => {
          onPress?.(content);
        }}
      >
        {content}
      </Button>
      {separator}
    </View>
  );
}
