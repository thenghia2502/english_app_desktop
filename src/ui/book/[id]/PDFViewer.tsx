"use client"

interface PDFViewerProps {
  pdfUrl?: string | null
  title: string
}

function extractGoogleDriveFileId(url: string): string | null {
  const match1 = url.match(/\/file\/d\/([^/]+)/)
  const match2 = url.match(/[?&]id=([^&]+)/)
  const match3 = url.match(/\/open\?id=([^&]+)/)

  if (match1) return match1[1]
  if (match2) return match2[1]
  if (match3) return match3[1]

  return null
}

function getGoogleDriveEmbedUrl(url?: string | null): string | null {
  if (!url || !url.trim()) {
    return null
  }

  const fileId = extractGoogleDriveFileId(url)
  if (fileId) {
    return `https://drive.google.com/file/d/${fileId}/preview`
  }
  return url
}

export function PDFViewer({ pdfUrl, title }: PDFViewerProps) {

  const embedUrl = getGoogleDriveEmbedUrl(pdfUrl)

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b bg-background px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground">{title}</p>
        </div>
      </div>

      {/* PDF Viewer + Canvas Overlay */}
      <div className="relative flex-1 overflow-hidden bg-muted/20">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            className="h-full w-full border-0 "
            title={title}
            // allow="autoplay"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">No PDF link available for this unit.</p>
          </div>
        )}
      </div>
    </div>
  )
}
