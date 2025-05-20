import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from "@mui/material";

type PaywallDialogProps = {
  open: boolean;
  onClose: () => void;
  onBuyMore: () => void;
};

export default function PaywallDialog({ open, onClose, onBuyMore }: PaywallDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Paywall</DialogTitle>
      <DialogContent>
        <Box
          sx={{
            fontWeight: 900,
            fontSize: "1.3rem",
            textAlign: "center",
            letterSpacing: 1,
            animation: "paywall-blink 0.7s steps(2, start) infinite, paywall-rainbow 3s linear infinite",
            background: "linear-gradient(90deg, red, orange, yellow, green, blue, indigo, violet, red)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            WebkitTextFillColor: "transparent",
            "@keyframes paywall-blink": {
              "0%, 49%": { opacity: 1 },
              "50%, 100%": { opacity: 0.2 }
            },
            "@keyframes paywall-rainbow": {
              "0%": { backgroundPosition: "0% 50%" },
              "100%": { backgroundPosition: "100% 50%" }
            },
            backgroundSize: "200% 200%",
            padding: 2,
            borderRadius: 2,
            marginBottom: 1,
            userSelect: "none"
          }}
        >
          🚨 ONLY YOUR FIRST DELAY CHANCE VIEW IS FREE! 🚨<br />
          <span style={{ fontSize: "1.1em" }}>
            BUY MORE TO SEE MORE PREDICTIONS!<br />
            <span role="img" aria-label="money">💸💸💸</span>
          </span>
        </Box>
        <Typography align="center" sx={{ mt: 2 }}>
          To see more predictions, please purchase more views.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={onBuyMore}
          sx={{
            fontWeight: 900,
            fontSize: "2rem",
            px: 6,
            py: 2,
            borderRadius: 3,
            animation: "paywall-blink 0.7s steps(2, start) infinite, paywall-rainbow 3s linear infinite, paywall-btn-blink 0.6s steps(2, start) infinite",
            background: "linear-gradient(90deg, red, blue)",
            backgroundClip: "padding-box",
            color: "white",
            "@keyframes paywall-blink": {
              "0%, 49%": { opacity: 1 },
              "50%, 100%": { opacity: 0.2 }
            },
            "@keyframes paywall-rainbow": {
              "0%": { backgroundPosition: "0% 50%" },
              "100%": { backgroundPosition: "100% 50%" }
            },
            "@keyframes paywall-btn-blink": {
              "0%, 49%": { background: "linear-gradient(90deg, red, blue)" },
              "50%, 100%": { background: "linear-gradient(90deg, blue, red)" }
            },
            backgroundSize: "200% 200%",
            display: "block",
            margin: "0 auto"
          }}
        >
          buy more
        </Button>
      </DialogActions>
    </Dialog>
  );
}
